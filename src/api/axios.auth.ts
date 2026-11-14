import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { emitirEstadoConexion } from './conexion';

const apiLogged: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false
});

/* =========================================================================
 * Política de reintentos
 *
 * Un reintento sólo tiene sentido si el servicio se interrumpió: no hubo
 * respuesta (red caída, servidor apagado) o el servidor avisó que está
 * temporalmente no disponible (502/503/504) o saturado (429).
 *
 * Nunca se reintenta:
 *  - un 401: el token de Sanctum venció o es inválido, repetir no lo arregla;
 *  - un POST/PUT/PATCH/DELETE: si la primera llegó al servidor, repetir podría
 *    duplicar el registro (por ejemplo, crear dos guías).
 * ========================================================================= */
const MAX_REINTENTOS = 3;
const METODOS_REINTENTABLES = ['get', 'head', 'options'];
const ESTADOS_TRANSITORIOS = [429, 502, 503, 504];

/** 401: token inválido o vencido. 419: sesión/CSRF vencida en Laravel. */
const ESTADOS_SESION_VENCIDA = [401, 419];

/**
 * Peticiones cuyo 401 no habla de nuestra sesión:
 *  - /api/logout: el usuario ya está saliendo;
 *  - /api/scop/*: el 401 viene del servicio externo de SCOP (su clave), no de Sanctum.
 */
const RUTAS_SIN_EXPIRACION = ['/api/logout', '/api/scop/'];

/** Petición liviana y autenticada para comprobar si el token sigue sirviendo. */
const RUTA_VERIFICACION = '/api/favoritos';

/**
 * `sinReintentos: true` en una petición: su 502/503 es una respuesta del
 * negocio (p. ej. "SUNAT aún no entrega el PDF"), no una caída. Se devuelve el
 * error al instante, sin reintentar ni marcar la conexión como caída.
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    sinReintentos?: boolean;
  }
}

type ConfigConReintentos = InternalAxiosRequestConfig & { __reintentos?: number };

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const esInterrupcionDelServicio = (error: AxiosError): boolean => {
  // Se pasa como `unknown`: el type guard de isCancel reduciría `error` a `never`.
  if (axios.isCancel(error as unknown)) return false;
  if (!error.response) return true;
  return ESTADOS_TRANSITORIOS.includes(error.response.status);
};

/** Espera creciente (1s, 2s, 4s…) con algo de azar; respeta `Retry-After` en un 429. */
const demoraPara = (error: AxiosError, intento: number): number => {
  const retryAfter = Number(error.response?.headers?.['retry-after']);
  if (error.response?.status === 429 && Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 10000);
  }
  return Math.min(1000 * 2 ** intento, 8000) + Math.random() * 300;
};

/* =========================================================================
 * Sesión expirada
 * ========================================================================= */
let sesionExpirando = false;

/**
 * Cliente sin interceptores para comprobar la sesión: si entrara por `apiLogged`
 * su propio 401 volvería a pasar por aquí.
 */
const verificador = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  timeout: 8000,
});

/** Una sola comprobación a la vez, aunque lleguen varios 401 juntos. */
let verificacionEnCurso: Promise<boolean> | null = null;

/**
 * ¿El token realmente dejó de servir? Un 401 suelto también aparece cuando el
 * servidor o su base de datos se cortan un momento, y en ese caso sacar al
 * usuario al login le hace perder lo que estaba haciendo. Sólo se confirma la
 * expiración si una segunda petición, hecha aparte, también responde 401/419.
 */
const sesionRealmenteVencida = (): Promise<boolean> => {
  // Sin internet no hay nada que confirmar: el token sigue siendo el mismo.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);

  const token = localStorage.getItem('AUTH_TOKEN');
  if (!token) return Promise.resolve(true);

  if (!verificacionEnCurso) {
    verificacionEnCurso = verificador
      .get(RUTA_VERIFICACION, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => false)
      .catch((error: AxiosError) => {
        const status = error.response?.status;
        // Sin respuesta (red, timeout) o error del servidor: no se puede afirmar nada.
        return status === 401 || status === 419;
      });
    // Se olvida enseguida para no dar por buena una sesión que venció después.
    void verificacionEnCurso.finally(() => {
      setTimeout(() => {
        verificacionEnCurso = null;
      }, 2000);
    });
  }
  return verificacionEnCurso;
};
/** Hubo un reintento o una caída: el próximo éxito se anuncia como "recuperada". */
let conexionInestable = false;

const limpiarSesionManual = () => {
  localStorage.removeItem('AUTH_TOKEN');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');
};

/**
 * Se ejecuta una sola vez aunque lleguen varios 401 a la vez. Guarda la ruta
 * actual para volver después del login (LoginForm ya lee `redirectAfterLogin`
 * y muestra el aviso con `?reason=expired`).
 */
const cerrarSesionExpirada = async () => {
  if (sesionExpirando) return;
  sesionExpirando = true;

  const { pathname } = window.location;
  if (!pathname.startsWith('/auth')) {
    sessionStorage.setItem('redirectAfterLogin', pathname);
  }

  try {
    // Import dinámico: authStore depende (vía AuthService) de este módulo.
    const { useAuthStore } = await import('../store/authStore');
    useAuthStore.getState().forceLogout();
  } catch (error) {
    console.error('No se pudo limpiar el store de sesión, limpiando a mano:', error);
    limpiarSesionManual();
  }

  if (!pathname.includes('/auth/login')) {
    window.location.assign('/auth/login?reason=expired');
  }
};

/* =========================================================================
 * Interceptores
 * ========================================================================= */
apiLogged.interceptors.request.use((config) => {
  // Con la sesión ya vencida no tiene sentido seguir enviando peticiones.
  if (sesionExpirando) {
    const controller = new AbortController();
    controller.abort();
    config.signal = controller.signal;
    return config;
  }

  const token = localStorage.getItem('AUTH_TOKEN') || '';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiLogged.interceptors.response.use(
  (response: AxiosResponse) => {
    if (conexionInestable) {
      conexionInestable = false;
      emitirEstadoConexion({ estado: 'recuperada' });
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as ConfigConReintentos | undefined;
    const status = error.response?.status;

    // 1) Puede ser el token vencido... o un corte momentáneo. Se comprueba antes
    //    de cerrar la sesión, y nunca se reintenta la petición original.
    if (status && ESTADOS_SESION_VENCIDA.includes(status)) {
      const url = config?.url || '';
      if (RUTAS_SIN_EXPIRACION.some((ruta) => url.includes(ruta))) {
        return Promise.reject(error);
      }

      if (await sesionRealmenteVencida()) {
        void cerrarSesionExpirada();
      } else {
        console.warn(`401 puntual en ${url}: el token sigue vigente, no se cierra la sesión.`);
        conexionInestable = true;
        emitirEstadoConexion({ estado: 'caida' });
      }
      return Promise.reject(error);
    }

    // 2) Interrupción del servicio: reintento con espera creciente, sólo si repetir es inocuo.
    if (config && !config.sinReintentos && esInterrupcionDelServicio(error)) {
      const metodo = (config.method || 'get').toLowerCase();
      const intentos = config.__reintentos ?? 0;

      if (METODOS_REINTENTABLES.includes(metodo) && intentos < MAX_REINTENTOS) {
        config.__reintentos = intentos + 1;
        conexionInestable = true;
        emitirEstadoConexion({ estado: 'reintentando', intento: config.__reintentos, maximo: MAX_REINTENTOS });
        await esperar(demoraPara(error, intentos));
        return apiLogged.request(config);
      }

      // Agotó los reintentos, o era una escritura que no se repite por seguridad.
      conexionInestable = true;
      emitirEstadoConexion({ estado: 'caida' });
    }

    if (status === 403) {
      console.warn('Acceso denegado (403):', config?.url);
    } else if (status && status >= 500) {
      console.error(`Error del servidor (${status}):`, config?.url);
    }

    return Promise.reject(error);
  }
);

export default apiLogged;

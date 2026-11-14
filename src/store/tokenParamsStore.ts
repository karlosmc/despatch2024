
import { create } from 'zustand';
import { ParamsInterface } from '../types/params.interface';
import { IToken } from '../types/token.interface';
import apiLogged from '../api/axios.auth';

const TOKEN_KEY = 'token_sunat';
const TOKEN_EXPIRY_KEY = 'token_sunat_expiry';
const PARAMS_KEY = 'sunat_params';

interface AuthTokenState {
  token: string | null;
  saveToken: (newToken: string, expiryTime: number) => void;
  getToken: () => Promise<string | null>;
  getSunatParams: () => Promise<void>;
  /**
   * Devuelve los parámetros listos para usar (con RUC). Si no están en memoria
   * los vuelve a pedir; si el servidor no responde usa la última copia buena
   * guardada. Lanza un mensaje claro solo si no hay ninguna de las dos.
   */
  asegurarParams: () => Promise<ParamsInterface>;
  params: ParamsInterface | null;
  clearAll: () => void; // Nuevo método para limpiar todo
}

export const useTokenParamsStore = create<AuthTokenState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  
  // Inicializar params desde localStorage
  params: (() => {
    try {
      const storedParams = localStorage.getItem(PARAMS_KEY);
      return storedParams ? JSON.parse(storedParams) : null;
    } catch (error) {
      console.error('Error parsing stored params:', error);
      return null;
    }
  })(),

  saveToken: (newToken: string, expiryTime: number) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    set({ token: newToken });
  },

  getToken: async () => {
    const { token, saveToken } = get();
    const expiryTimeGet = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (expiryTimeGet) {
      const UnixExpiryTimeGet = new Date(parseInt(expiryTimeGet) * 1000);
      const UnixCurDateGet = new Date(Date.now());
      if (UnixCurDateGet < UnixExpiryTimeGet) {
        return token;
      }
    }

    const data = await checkToken();
    if (data) {
      const expiryTime = data?.expiryTime;
      const UnixExpiryTime = new Date(expiryTime * 1000);
      const UnixCurDate = new Date(Date.now());

      if (expiryTime && UnixCurDate < UnixExpiryTime) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        set({ token: data.access_token });
        return data.access_token;
      }
    }

    const newToken = await fetchNewToken();
    if (newToken) {
      saveToken(newToken.access_token, newToken.expiryTime);
      return newToken.access_token;
    }

    return null;
  },
  
  getSunatParams: async () => {
    const data = await fetchSunatParameters();

    // Solo se reemplaza con datos válidos: una respuesta vacía o rara no debe
    // borrar la última copia buena (antes dejaba params en null).
    if (paramsValidos(data)) {
      localStorage.setItem(PARAMS_KEY, JSON.stringify(data));
      set({ params: data });
    }
  },

  asegurarParams: async () => {
    const actuales = get().params;
    if (paramsValidos(actuales)) return actuales;

    // Varias pantallas pueden pedirlos a la vez: una sola consulta
    if (!cargaParams) {
      cargaParams = get()
        .getSunatParams()
        .catch((error) => {
          console.warn('No se pudieron recargar los parámetros SUNAT:', error);
        })
        .finally(() => {
          cargaParams = null;
        });
    }
    await cargaParams;

    const recargados = get().params;
    if (paramsValidos(recargados)) return recargados;

    // Sin servidor: la última copia buena del navegador
    const guardados = leerParamsGuardados();
    if (paramsValidos(guardados)) {
      set({ params: guardados });
      return guardados;
    }

    throw new Error(
      'No se pudieron cargar los parámetros de SUNAT (RUC, certificado). Revisa tu conexión e inténtalo de nuevo.'
    );
  },

  clearAll: () => {
    // Limpiar el estado en memoria
    set({ 
      token: null, 
      params: null 
    });
    
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(PARAMS_KEY);
    
    console.log("TokenParamsStore limpiado completamente");
  }
}));

// Funciones auxiliares (fuera del store)

/** Consulta en curso de los parámetros (se comparte entre llamadas simultáneas). */
let cargaParams: Promise<void> | null = null;

/** Sirven para emitir: al menos traen el RUC. */
const paramsValidos = (p: ParamsInterface | null | undefined): p is ParamsInterface =>
  Boolean(p && String(p.ruc ?? '').trim() !== '');

const leerParamsGuardados = (): ParamsInterface | null => {
  try {
    const guardados = localStorage.getItem(PARAMS_KEY);
    return guardados ? JSON.parse(guardados) : null;
  } catch {
    return null;
  }
};

const fetchSunatParameters = async (): Promise<ParamsInterface | null> => {

  try {
    // `status`, no `statusText`: con HTTP/2 o tras un proxy statusText llega vacío
    const { data, status } = await apiLogged('/api/sunat/parametros')
    return status === 200 ? data?.data ?? null : null;
  } catch (error:any) {
    console.log('Hubo un error al consultar los parametros');
    throw error?.response?.data?.message || 'Hubo un error al consultar los parametros';
  }
};

const fetchNewToken = async (): Promise<IToken | null> => {
  try {
    const { data, status } = await apiLogged.post('/api/tokensunat')
    return status === 200 || status === 201 ? data : null;
  } catch (error:any) {
    console.log('Hubo un error al crear el token');
    throw error?.response?.data?.message || 'Hubo un error al crear el token';
  }
};

const checkToken = async (): Promise<IToken | null> => {
  try {
    const { data, status } = await apiLogged('/api/tokensunat');
    return status === 200 ? data : null;
  } catch (error:any) {
    console.log('Hubo un error al obtener el token');
    throw error?.response?.data?.message || 'Hubo un error al obtener el token';
  }
};

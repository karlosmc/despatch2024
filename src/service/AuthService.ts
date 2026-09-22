0

import apiLogged from "../api/axios.auth";
import { apiInit } from "../api/axios.ini";
import { User } from "../types/user.interface";
import { mensajeDeErrorApi } from "../utils/mensajeError";

/** Motivo del rechazo del login, siempre como texto para mostrarlo tal cual. */
const mensajeLogin = (error: any): string => {
  if (typeof error === 'string') return error;
  const status = error?.response?.status;
  const data = error?.response?.data;
  if ((status === 401 || status === 403) && !data?.message && !data?.error) {
    return 'Documento o contraseña incorrectos.';
  }
  if (status === 404) return 'El servicio de inicio de sesión no está disponible. Contacta al administrador.';
  return mensajeDeErrorApi(error, 'No se pudo iniciar sesión');
};



export const authService = {

  login: async (credentials: any): Promise<User> => {
    // Simulate an API call for user authentication
    try {
      const { data } = await apiInit.post('/api/login', credentials);

      // El backend también rechaza con HTTP 200: `{ errors }` o `{ token: "", error }`
      // (p. ej. cuenta sin aprobar). Sin token no hay sesión.
      const rechazo = data?.errors || data?.error;
      if (rechazo || !data?.token || !data?.user) {
        localStorage.removeItem('AUTH_TOKEN');
        throw typeof rechazo === 'string' && rechazo
          ? rechazo
          : 'No se pudo iniciar sesión. Verifica tus datos.';
      }

      localStorage.setItem('AUTH_TOKEN', data.token)
      return data.user;

    } catch (error: any) {
      console.error("Error en AuthService login:", error);
      
      // Reenviar el error completo para que LoginForm pueda manejarlo
      throw mensajeLogin(error);
    }
  },

  logout: async () => {
    try {
      // Intentar hacer logout en el servidor
      await apiLogged.post('/api/logout');
    } catch (e) {
      // Si falla la petición del servidor, igual continuamos con la limpieza local
      console.error("Error en logout del servidor:", e);
    } finally {
      // Siempre limpiar el storage local, independientemente del resultado del servidor
      localStorage.removeItem('AUTH_TOKEN');
      
      localStorage.removeItem('sunat_params');
      
      console.log("Logout local completado - tokens eliminados");
    }
  },

  register: async (credentials: any) => {
    try {

      const { data } = await apiInit.post('/api/registro', credentials);
      // La cuenta nueva queda pendiente de aprobación: no se abre sesión aquí,
      // el usuario entra desde el login cuando el administrador la apruebe.
      if (data?.errors || data?.error) throw data.errors || data.error;
      return data;

    } catch (error: any) {
      console.error("Error en AuthService register:", error);
      
      // Reenviar el error completo para que RegisterForm pueda manejarlo
      throw mensajeDeErrorApi(error, 'No se pudo completar el registro');
    }

  },

}
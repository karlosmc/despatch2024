0

import apiLogged from "../api/axios.auth";
import { apiInit } from "../api/axios.ini";
import { User } from "../types/user.interface";



export const authService = {

  login: async (credentials: any): Promise<User> => {
    // Simulate an API call for user authentication
    try {
      const { data } = await apiInit.post('/api/login', credentials);

      // Simulate setting a token in cookies or local storage
      localStorage.setItem('AUTH_TOKEN', data.token)
      

      // console.log(data);
      return data.user;

    } catch (error: any) {
      console.error("Error en AuthService login:", error);
      
      // Reenviar el error completo para que LoginForm pueda manejarlo
      if (error?.response) {
        // Error HTTP con respuesta del servidor
        throw error;
      } else if (error?.message) {
        // Error de JavaScript/Network
        throw error;
      } else {
        // Error genérico
        throw new Error("Error en login");
      }
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
      localStorage.setItem('AUTH_TOKEN', data.token)

    } catch (error: any) {
      console.error("Error en AuthService register:", error);
      
      // Reenviar el error completo para que RegisterForm pueda manejarlo
      if (error?.response) {
        // Error HTTP con respuesta del servidor
        throw error;
      } else if (error?.message) {
        // Error de JavaScript/Network
        throw error;
      } else {
        // Error genérico
        throw new Error("Error en registro");
      }
    }

  },

}
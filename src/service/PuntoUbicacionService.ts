import apiLogged from "../api/axios.auth"
import { puntoUbicacion } from "../types/puntoubicacion.interface";


export const PuntoUbicacionService = {

  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/puntos?${params}`)
      return data;
    } catch (error: any) {
      console.error("Error al obtener los puntos de ubicación:", error);
      throw error?.response?.data?.message || "Error al obtener los puntos de ubicación";
    }
  },

  save: async (puntos: puntoUbicacion) => {
    try {
      const { data } = await apiLogged.post('/api/puntos', {
        ubigeo: puntos.ubigeo,
        direccion: puntos.direccion.toUpperCase()|| '',
        isCompany: puntos.isCompany,
        rznSocial: puntos.rznSocial.toUpperCase()|| '',
        ruc: puntos.ruc || '',
        nombreCorto: puntos.nombreCorto.toUpperCase()|| '',
        codLocal: puntos.codLocal || ''
      })

      return data.punto;

    } catch (error:any) {
      console.error("Error al guardar el punto de ubicación:", error);
      throw error?.response?.data?.message || "Error al guardar el punto de ubicación";

    }
  },

  update: async (puntos: puntoUbicacion) => {
    try {
      const { data } = await apiLogged.put(`/api/puntos/${puntos.id}`, {
        ubigeo: puntos.ubigeo,
        direccion: puntos.direccion.toUpperCase()|| '',
        isCompany: puntos.isCompany,
        rznSocial: puntos.rznSocial.toUpperCase()|| '',
        ruc: puntos.ruc || '',
        nombreCorto: puntos.nombreCorto.toUpperCase()|| '',
        codLocal: puntos.codLocal || ''
      })

      return data.punto;

    } catch (error:any) {
      console.error("Error al actualizar el punto de ubicación:", error);
      throw error?.response?.data?.message || "Error al actualizar el punto de ubicación";

    }
  }



}
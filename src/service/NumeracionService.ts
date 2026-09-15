import apiLogged from "../api/axios.auth"
import { numeracion } from "../types/numeracion.interface";

export const NumeracionService = {
  get: async () => {
    try {
      const { data } = await apiLogged('/api/numeracion');
      return data;
    } catch (error: any) {
      console.log('Hubo un error al obtener la numeración:', error);
      throw error?.response?.data?.message || 'Hubo un error al obtener la numeración'
    }
  },

  save: async (numeracion: numeracion, secundario: any) => {
    try {


      const { data } = await apiLogged.post(`/api/numeracion`, {
        nombre: numeracion.nombre.toUpperCase() || '',
        numeroActual: numeracion.numeroActual,
        id_puntoemision: numeracion.id_puntoemision,
        primario: numeracion.primario?.id || null,
        secundario: secundario,
        serie: numeracion.serie

      })
      return data.numeracion
    } catch (error: any) {
      console.log('Hubo un error al guardar la numeración:', error);
      throw error?.response?.data?.message || 'Hubo un error al guardar la numeración'
    }
  },
  update: async (numeracion: numeracion, secundario: any) => {
    try {


      const { data } = await apiLogged.put(`/api/numeracion/${numeracion.id}`, {
        nombre: numeracion.nombre.toUpperCase() || '',
        numeroActual: numeracion.numeroActual,
        id_puntoemision: numeracion.id_puntoemision,
        primario: numeracion?.primario?.id || null,
        secundario: secundario,
        serie: numeracion.serie
      })
      return data.numeracion
    } catch (error: any) {
      console.log('Hubo un error al actualizar la numeración:', error);
      throw error?.response?.data?.message || 'Hubo un error al actualizar la numeración'
    }
  },
  getNumeracionByIdPuntoEmision: async (id: number) => {
    try {
      const { data } = await apiLogged.get(`/api/numeracion/actualbypunto?id_puntoemision=${id}`);
      return data;
    } catch (error: any) {
      console.log('Hubo un error al obtener la numeración por ID de punto de emisión:', error);
      throw error?.response?.data?.message || 'Hubo un error al obtener la numeración por ID de punto de emisión';
    }
  }
}
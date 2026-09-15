import apiLogged from "../api/axios.auth"
import { puntoEmision } from "../types/puntoemision.interface";

export const PuntoEmisionService = {

  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/puntoemision?${params}`)
      return data;
    } catch (error: any) {
      console.log('Hubo un error al obtener los puntos de emisión: ', error);
      throw error?.response?.data?.message || 'Hubo un error al obtener los puntos de emisión';
    }
  },
  getPuntosByUserId:async(id:number)=>{
    try {
      const { data } = await apiLogged(`/api/usuario/${id}`)
      
      return data;
    } catch (error: any) {
      console.log('Hubo un error al obtener los puntos de emisión por usuario: ', error);
      throw error?.response?.data?.message || 'Hubo un error al obtener los puntos de emisión por usuario';
    }
  },
  save: async (puntoemision: puntoEmision) => {

    try {
      const { data } = await apiLogged.post(`/api/puntoemision`, {
        codigo: puntoemision.codigo.toUpperCase() || '',
        nombre: puntoemision.nombre.toUpperCase() || '',
        codLocal: puntoemision.codLocal,
        direccion: puntoemision.direccion.toUpperCase() || '',
        users: puntoemision.users,

      })
      return data.puntoemision
    } catch (error) {
      console.log('Hubo un error al guardar el punto de emisión: ', error);
      throw error?.response?.data?.message || 'Hubo un error al guardar el punto de emisión';
    }
  },
  update: async (puntoemision: puntoEmision) => {

    try {
      const { data } = await apiLogged.put(`/api/puntoemision/${puntoemision.id}`, {
        codigo: puntoemision.codigo.toUpperCase() || '',
        nombre: puntoemision.nombre.toUpperCase() || '',
        codLocal: puntoemision.codLocal,
        direccion: puntoemision.direccion.toUpperCase() || '',
        users: puntoemision.users,
      })
      return data.puntoemision
    } catch (error) {
      console.log('Hubo un error al guardar el punto de emisión: ', error);
      throw error?.response?.data?.message || 'Hubo un error al guardar el punto de emisión';
    }
  },
}
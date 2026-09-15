import apiLogged from "../api/axios.auth"
import { conductor } from "../types/conductor.interface";

export const ConductoresService = {

  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/conductor?${params}`);
      return data;
    } catch (error: any) {
      console.log("Error al obtener los conductores: ", error);
      throw error?.response?.data?.message || "Error al obtener a los conductores";
    }
  },
  save: async (conductor: conductor) => {
    try {
      const { data } = await apiLogged.post(`/api/conductor`, {

        nroDoc: conductor.nroDoc,
        nombres: conductor.nombres.toUpperCase() || '',
        isCompany: conductor.isCompany,
        apellidos: conductor.apellidos.toUpperCase() || '',
        nombreCorto: conductor.nombreCorto.toUpperCase() || '',
        licencia: conductor.licencia.toUpperCase() || '',
        tipoDoc: conductor.tipoDoc,

      });
      return data.conductor

    } catch (error: any) {

      console.log("Error al guardar al conductor: ", error);
      throw error?.response?.data?.message || "Error al guardar al conductor";
    }
  },

  update: async (conductor: conductor) => {
    try {
      const { data } = await apiLogged.put(`/api/conductor/${conductor.id}`, {
        nroDoc: conductor.nroDoc,
        nombres: conductor.nombres.toUpperCase() || '',
        isCompany: conductor.isCompany,
        apellidos: conductor.apellidos.toUpperCase() || '',
        nombreCorto: conductor.nombreCorto.toUpperCase() || '',
        licencia: conductor.licencia.toUpperCase() || '',
        tipoDoc: conductor.tipoDoc,
      });
      return data.conductor

    } catch (error: any) {

      console.log("Error al actualizar al conductor: ", error);
      throw error?.response?.data?.message || "Error al actualizar al conductor";
    }
  },
  getConductorByNroDoc:async(nroDoc:string)=>{
    try {
      const { data } = await apiLogged(`/api/conductor/buscar?nroDoc=${nroDoc}`);
      return data;
    } catch (error: any) {
      console.log("Error al obtener al conductor por nroDoc: ", error);
      throw error?.response?.data?.message || "Error al obtener al conductor por nroDoc";
    }
  }
}
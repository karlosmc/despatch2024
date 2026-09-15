
import apiLogged from "../api/axios.auth";
import { transportista } from "../types/transportista.interface";

export const TransportistaService = {

  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/transportistas?${params}`);

      return data;
    } catch (error: any) {
      console.error("Error al obtener los transportistas:", error);
      throw error?.response?.data?.message || "Error al obtener los transportistas";
    }
  },
  save: async (transportista: transportista) => {
    try {
      const { data } = await apiLogged.post(`/api/transportistas`, {
        numDoc: transportista.numDoc,
        rznSocial: transportista.rznSocial.toUpperCase() || '',
        nombreCorto: transportista.nombreCorto.toUpperCase() || '',
        nroMtc: transportista.nroMtc.toUpperCase() || '',
        tipoDoc: transportista.tipoDoc,
      });
      return data.transportista;
    }
    catch (error: any) {
      console.error("Error al guardar el transportistas:", error);
      throw error?.response?.data?.message || "Error al guardar el transportistas";
    }
  },
  update: async (transportista: transportista) => {
    try {
      const { data } = await apiLogged.put(`/api/transportistas/${transportista.id}`, {
        numDoc: transportista.numDoc,
        rznSocial: transportista.rznSocial.toUpperCase() || '',
        nombreCorto: transportista.nombreCorto.toUpperCase() || '',
        nroMtc: transportista.nroMtc.toUpperCase() || '',
        tipoDoc: transportista.tipoDoc,

      });
      return data.transportista;
    }
    catch (error: any) {
      console.error("Error al guardar el transportistas:", error);
      throw error?.response?.data?.message || "Error al guardar el transportistas";
    }
  }

}
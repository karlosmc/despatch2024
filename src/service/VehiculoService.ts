import apiLogged from "../api/axios.auth"
import { vehiculo } from "../types/vehiculo.interface";

export const VehiculoService = {
  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/vehiculos?${params}`)
      return data;
    } catch (error: any) {
      console.log("Hubo un error al obtener los vehiculos: ", error);
      throw error?.response?.data?.message || 'Hubo un error al obtener los vehiculos';
    }
  },
  save: async (vehiculo: vehiculo) => {
    try {
      const { data } = await apiLogged.post(`/api/vehiculos`, {
        placa: vehiculo.placa.toUpperCase() || '',
        nroCirculacion: vehiculo.nroCirculacion.toUpperCase() || '',
        nroAutorizacion: vehiculo.nroAutorizacion.toUpperCase() || '',
        codEmisor: vehiculo.codEmisor.toUpperCase() || '',
        isCompany: vehiculo.isCompany,
        nombreCorto: vehiculo.nombreCorto.toUpperCase() || '',
      });
      return data.vehiculo

    } catch (error: any) {
      console.log("Hubo un error al guardar el vehiculo: ", error);
      throw error?.response?.data?.message || 'Hubo un error al guardar el vehiculo';
    }
  },
  update: async (vehiculo: vehiculo) => {
    try {
      const { data } = await apiLogged.put(`/api/vehiculos/${vehiculo.id}`, {
        placa: vehiculo.placa.toUpperCase() || '',
        nroCirculacion: vehiculo.nroCirculacion.toUpperCase() || '',
        nroAutorizacion: vehiculo.nroAutorizacion.toUpperCase() || '',
        codEmisor: vehiculo.codEmisor.toUpperCase() || '',
        isCompany: vehiculo.isCompany,
        nombreCorto: vehiculo.nombreCorto.toUpperCase() || '',

      });
      return data.vehiculo

    } catch (error: any) {
      console.log("Hubo un error al actualizar el vehiculo: ", error);
      throw error?.response?.data?.message || 'Hubo un error al actualizar el vehiculo';
    }
  }
}
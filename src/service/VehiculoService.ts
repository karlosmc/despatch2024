import apiLogged from "../api/axios.auth"
import { vehiculo } from "../types/vehiculo.interface";
import { mensajeDeErrorApi } from "../utils/mensajeError";

const mayus = (texto?: string | null) => (texto ?? '').trim().toUpperCase();

/** Campos compartidos del vehículo. `fav` va aparte (FavoritoService: es por usuario). */
const cuerpo = (v: vehiculo) => ({
  placa: mayus(v.placa),
  nroCirculacion: mayus(v.nroCirculacion),
  nroAutorizacion: mayus(v.nroAutorizacion),
  codEmisor: mayus(v.codEmisor),
  isCompany: Boolean(v.isCompany),
  nombreCorto: mayus(v.nombreCorto),
  // El backend los acepta como booleanos; se envían siempre para no depender de sus valores por defecto.
  tracto: v.tracto ?? true,
  glp: v.glp ?? false,
});

export const VehiculoService = {
  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/vehiculos?${params}`)
      return data;
    } catch (error: any) {
      console.log("Hubo un error al obtener los vehiculos: ", error);
      throw mensajeDeErrorApi(error, 'Hubo un error al obtener los vehículos');
    }
  },
  save: async (vehiculo: vehiculo) => {
    try {
      const { data } = await apiLogged.post(`/api/vehiculos`, cuerpo(vehiculo));
      return data.vehiculo
    } catch (error: any) {
      console.log("Hubo un error al guardar el vehiculo: ", error);
      throw mensajeDeErrorApi(error, 'Hubo un error al guardar el vehículo');
    }
  },
  update: async (vehiculo: vehiculo) => {
    try {
      const { data } = await apiLogged.put(`/api/vehiculos/${vehiculo.id}`, cuerpo(vehiculo));
      return data.vehiculo
    } catch (error: any) {
      console.log("Hubo un error al actualizar el vehiculo: ", error);
      throw mensajeDeErrorApi(error, 'Hubo un error al actualizar el vehículo');
    }
  },
}

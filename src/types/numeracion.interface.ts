import { EnvioVehiculo } from "./guias/guiaremision.interface";
import { puntoEmision } from "./puntoemision.interface";

export interface numeracion {
  id?:number,
  nombre:string,
  serie:string,
  numeroActual:number,
  id_puntoemision:number,
  primario?:EnvioVehiculo,
  secundario?:EnvioVehiculo[],
  puntoemision?:puntoEmision,
}
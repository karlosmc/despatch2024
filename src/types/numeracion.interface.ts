import { EnvioVehiculo } from "./guias/guiaremision.interface";

export interface numeracion {
  id?:number,
  nombre:string,
  serie:string,
  numeroActual:number,
  id_puntoemision:number,
  primario?:EnvioVehiculo,
  secundario?:EnvioVehiculo[],
}
import { Direccion } from "./guias/guiaremision.interface";

export interface puntoUbicacion extends Direccion{
  id?:number,
  fav?:boolean,
  isCompany?:boolean,
  nombreCorto?:string,
  fullubigeo?:string,
  rznSocial?:string,
}
import { User } from "./user.interface";

export interface puntoEmision {
  id?:number,
  nombre:string,
  codigo:string,
  codLocal?:string,
  direccion?:string,
  ruc?:string,
  users?:User[]
}


// export interface puntoEmision {
//   id?:number,
//   nombre:string,
//   serie:string,
//   numeroActual:number,
//   id_puntoemision:number,
// }
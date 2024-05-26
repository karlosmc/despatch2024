import { Client, Direccion } from "./doc.interface";

export interface Login {
    
  name:   string;
  password:    string;
  empresa: string;
  documento:string;
  email:string;
  estado?:string;
}


export interface UserLogin {
  alias:string;
  company:string;
  directions:DirectionsUser[];
  driver?:DriverUser;
  vehiculo:string;
  sercor:SerCorUser;
  clientes:ClientCompany[];
  products: Producto[];
}

export interface DirectionsUser  extends Direccion{
  id:string;
  company:string;
  direction:string;
  isconcurrent:string;
  tipo:string;
  alias:string;
}

export interface Producto {
  id:string;
  company:string;
  product:string;
  codigo:string;
  codProdSunat:string;
  descripcion:string;
  alias:string;
  unidad:string;
}


export interface DriverUser {
  apellidos:string;
  company:string;
  id:string;
  licencia:string;
  nombres:string;
  nroDoc:string;
  tipo:string;
  tipoDoc:string;
}

export interface SerCorUser {
  serie:string;
  correlativo:string;
}

export interface ClientCompany extends Client {
  id: string;
  client: string;
  alias: string;
}
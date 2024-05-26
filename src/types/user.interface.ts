export interface User {
  id?:number;
  name:   string;
  password: string;
  id_empresa: number;
  documento:string;
  email:string;
  estado?:string;
}

export interface LoginUser {
  password: string;
  documento:string;
  id_empresa: number;
}
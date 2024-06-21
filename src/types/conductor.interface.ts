export interface conductor {
  id?: number;
  nroDoc: string;
  nombres: string;
  apellidos: string;
  licencia: string;
  fav: boolean;
  isCompany: boolean;
  tipodocumento?:string;
  tipoDoc?:string;
  nombreCorto?:string;
}
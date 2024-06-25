export interface vehiculo {
  id?: number;
  placa: string;
  nroCirculacion?: string;
  nroAutorizacion?: string;
  codEmisor?: string;
  fav: boolean;
  isCompany: boolean;
  nombreCorto?:string;
}
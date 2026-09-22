export interface vehiculo {
  id?: number;
  placa: string;
  nroCirculacion?: string;
  nroAutorizacion?: string;
  codEmisor?: string;
  fav: boolean;
  isCompany: boolean;
  nombreCorto?:string;
  /** Es tracto (cabeza). */
  tracto?: boolean;
  /** Cisterna de GLP: en la guía rápida su placa es la sucursal del SCOP. */
  glp?: boolean;
}
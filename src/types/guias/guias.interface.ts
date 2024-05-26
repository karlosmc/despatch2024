
export interface DatosGenerales {
  version:      string;
  tipoDoc:      string;
  serie:        string;
  correlativo:  string;
  observacion:  string;
  fechaEmision: string;
  codTraslado:   string;
  desTraslado:   string;
  modTraslado:   string;
  fecTraslado:   string;
}

export interface Client {
    
  tipoDoc:   string;
  numDoc:    string;
  rznSocial: string;
  direccion?: string;
  ubigeo?:string

}

export interface DatosPersonas {
  destinatario: Client;//Listo
  tercero?:      Client | null;//Listo
  comprador:    Client | null;//Listo
}

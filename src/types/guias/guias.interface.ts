

export interface Guia {
  version:      string;
  tipoDoc:      string;
  serie:        string;
  correlativo:  string;
  observacion:  string;
  fechaEmision: string;
  
  codTraslado:   string;
  desTraslado:   string;
  modTraslado:   string;
  // fecTraslado:   string;

  destinatario: Persona;
  comprador?: Persona;
  fecTraslado: string;
  indicadores:   string[];
  pesoItems?:     number|null;
  sustentoPeso?:  string|null;
  pesoTotal:     number;
  undPesoTotal:  string;
  numBultos:     number;
  indTransbordo?: string|null;
}

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

export interface Persona {
    
  tipoDoc:   string;
  numDoc:    string;
  rznSocial: string;
}

export interface DatosPersonas {
  destinatario: Persona;//Listo
  // tercero?:      Persona | null;//Listo
  comprador:    Persona|null;//Listo
}

export interface DatosEnvio {
  fecTraslado: string;
  indicadores:   string[];
  pesoItems?:     number|null;
  sustentoPeso?:  string|null;
  pesoTotal:     number;
  undPesoTotal:  string;
  numBultos:     number;
  indTransbordo?: string|null;
}

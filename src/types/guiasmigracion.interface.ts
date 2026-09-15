export interface GuiasResponse {
  id:           number;
  migrado:      number;
  serie:        string;
  correlativo:  string;
  fechaEmision: string;
  envio:        Envio;
  electronico:  Electronico;
}

export interface Electronico {
  id:          number;
  id_despatch: number;
  serie:       string;
  numero:      string;
  fecha:       string;
  estado:      string;
  estadoSunat: string;
  descripcion: string;
}

export interface Envio {
  id:               number;
  pesoTotal:        string;
  ubicaciones:      Ubicaciones[];
  motivo_traslado:  MotivoTraslado;
}

export interface MotivoTraslado {
  id:          number;
  codTraslado: string;
  desTraslado: string;
}

export interface Ubicaciones {
  id:                number;
  id_shipment:       number;
  id_puntoubicacion: number;
  ubigeo:            string;
  direccion:         string;
  codLocal:          string;
  ruc:               string;
  tipo:              string;
  almacenes_fafio:   AlmacenesFafio[];
}

export interface AlmacenesFafio {
  id:                 number;
  id_almacen_fafio:   string;
  id_punto_ubicacion: number;
  nombre:             string;
  entrada:            null;
  salida:             null;
  created_at:         null;
  updated_at:         null;
}

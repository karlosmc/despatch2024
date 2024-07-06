export interface panelguia {
  id?:number;
  id_despatch?:number;
  serie:string;
  numero:string;
  fecha:string;
  estado:string;
  estadoSunat?:string;
  codigoSunat?:string;
  descripcion?:string;
  rutaXml?:string;
  rutaCdr?:string;
  rutaPdf?:string;
  hashQr?:string;
  token?:string;
  ticket?:string;
}
import { Transportista } from "../doc.interface";

export interface Despatch {
    doc: GuiaRemision;
}

export interface GuiaRemision {
    /* Datos generales */
    datosGenerales: DatosGenerales,

    /* Datos de personas*/
    destinatario: Client;//DatosPersonas
    tercero?:      Client | null;//DatosPersonas
    comprador?:    Client | null;//DatosPersonas

    /* Datos de envio*/
    envio:        Envio;//Listo
    addDocs?:      AddDoc[];//Listo
    details?:      Detail[];//Listo
    exportacion?: EnvioExportacion,
    puertoAeropuerto?:EnvioPuertoAeropuerto,
    transportista?:Transportista,
    vehiculo:EnvioVehiculo,
    choferes:EnvioChoferes[],
    partida:Direccion,
    llegada:Direccion,
    observacion:string,
    
}

export interface DatosGenerales {
    version:      string;//DatosGenerales
    tipoDoc:      string;//DatosGenerales
    serie:        string;//DatosGenerales
    correlativo:  string;//DatosGenerales
    fechaEmision: string;//DatosGenerales
}

export interface DocTest {
    serie:        string;
    correlativo:  string;
    observacion?:  string;
    fechaEmision: string;
    destinatario?: Client;
}

export interface AddDoc {
    
    tipoDesc: string;
    tipo:     string;
    nro:      string;
    emisor:   string;
}


export interface Client {
    
    tipoDoc:   string;
    numDoc:    string;
    rznSocial: string;
}

export interface Detail {
    id?:string;
    codigo:       string;
    descripcion:  string;
    unidad:       string;
    cantidad:     number;
    codProdSunat: string;
    atributos?:    Atributo[] | null;
}

export interface Atributo {
    
    code:      string;
    name:      string;
    value:     string;
    fecInicio: null;
    fecFin:    null;
    duracion:  null;
}

export interface Envio {
    
    codTraslado:   string;//DatosGenerales
    desTraslado:   string;//DatosGenerales
    indTransbordo?: string|null;
    indicadores:   string[];
    pesoItems?:     number|null;
    sustentoPeso?:  string|null;
    pesoTotal:     number;
    undPesoTotal:  string;
    numBultos:     number;
    modTraslado:   string;//DatosGenerales
    fecTraslado:   string;//DatosGenerales
    
    // choferes?:      EnvioChoferes[]|null;//Listo
    
    
    // vehiculo?:      EnvioVehiculo; //listo
    // llegada:       Direccion; //listo
    // partida:       Direccion; //listo
}

export interface EnvioExportacion {
  contenedores?:  string[];
}

export interface EnvioPuertoAeropuerto{
    puerto?:        Puerto|null;//Listo
    aeropuerto?:    Puerto|null;//Listo
}

export interface EnvioTransportista{
  transportista?: EnvioTransportista|null; //Listo
}



export interface Puerto {
    codigo: string;
    nombre: string;
}

export interface EnvioChoferes {
    tipo:      string;
    tipoDoc:   string;
    nroDoc:    string;
    nombres:   string;
    apellidos: string;
    licencia:  string;
}

export interface Direccion {
    ubigeo:    string;
    direccion: string;
    codLocal:  string;
    ruc:       string;
}

export interface EnvioTransportista extends Client {
    id: string | null;
    nroMtc: string;
}

export interface EnvioVehiculo {
    placa:           string;
    nroCirculacion?:  string|null;
    codEmisor?:       string|null;
    nroAutorizacion?: string|null;
    secundarios?:     EnvioVehiculo[] | null;
}

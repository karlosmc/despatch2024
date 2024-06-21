// import { dataFound } from "./persona.interface";

export interface Despatch {
    doc: Doc;
}

export interface Doc {
    version:      string;//DatosGenerales
    tipoDoc:      string;//DatosGenerales
    serie:        string;//DatosGenerales
    correlativo:  string;//DatosGenerales
    observacion:  string;//DatosGenerales
    fechaEmision: string;//DatosGenerales
    company:      Company;//Listo
    destinatario: Client;//DatosPersonas
    tercero?:      Client | null;//DatosPersonas
    comprador:    Client | null;//DatosPersonas
    envio:        Envio;//Listo
    addDocs?:      AddDoc[];//Listo
    details?:      Detail[];//Listo
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

export interface Company {
    ruc:             string;
    razonSocial:     string;
    nombreComercial: string;
    email:           string;
    telephone:       string;
    address:         Address;
    createdAt:       Date;
}

export interface Address {
    id:           string;
    ubigeo:       string;
    codigoPais:   string;
    departamento: string;
    provincia:    string;
    distrito:     string;
    urbanizacion: string;
    direccion:    string;
    codLocal:     string;
    createdAt:    Date;
}



export interface Client {
    
    tipoDoc:   string;
    numDoc:    string;
    rznSocial: string;
    direccion?: string;
    ubigeo?:string

}


export interface Detail {
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
    contenedores?:  string[];
    choferes?:      Choferes[]|null;//Listo
    modTraslado:   string;//DatosGenerales
    fecTraslado:   string;//DatosGenerales
    puerto?:        Puerto|null;//Listo
    aeropuerto?:    Puerto|null;//Listo
    transportista?: Transportista|null; //Listo
    vehiculo?:      Vehiculo; //listo
    llegada:       Direccion; //listo
    partida:       Direccion; //listo
}

export interface Puerto {
    codigo: string;
    nombre: string;
}

export interface Choferes {
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

export interface Transportista extends Client {
    id: string | null;
    nroMtc: string;
}

export interface Vehiculo {
    placa:           string;
    nroCirculacion?:  string|null;
    codEmisor?:       string|null;
    nroAutorizacion?: string|null;
    secundarios?:     Vehiculo[] | null;
}

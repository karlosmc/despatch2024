export interface dniData {
    dni: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    ubigeo?: string;
    direccion?: string;
  }

  export interface rucData {
    ruc: string;
    razonSocial: string;
    nombreComercial: string;
    direccion?: string;
    ubigeo?: string;
  }

  export interface dataFound {

    dniData?: dniData | null;
    rucData?: rucData | null;
  }

  export interface persona {
    id?: number;
    numDoc: string;
    rznSocial: string;
    email?: string;
    telephone?: string;
    fav: boolean;
    isCompany: boolean;
    // id_tipodocumento?: number;
    tipodocumento?:string;
    tipoDoc?:string;
    nombreCorto?:string;
  }

  export interface searchPersona {
    status:string;
    message:string;

    persona:{
      numero:string;
      nombreRazonSocial:string;
      nombres?:string;
      apellidos?:string;
      direccionCompleta:string;
      ubigeo?:string
    }

  }
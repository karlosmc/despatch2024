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
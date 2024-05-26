export interface ClientInterface {
    id:        string;
    tipoDoc:   string;
    numDoc:    string;
    rznSocial: string;
    email:     string;
    telephone: string;
    address?: Address;
}

export interface result  {
    message:string
    success:boolean
  }

export interface data {
    result: result
  }

  export interface Address {
    ubigeo: string
    direccion: string
    isMain:boolean
  }
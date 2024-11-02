import * as yup from "yup";
import { object } from "yup";


// export const LoginValidate = yup.object().shape({
//     tipoDoc:   yup.string().trim().required("El Tipo de documento es requerido"),
//     numDoc:    yup.string().trim().required("El Número de documento es requerido"),
//     rznSocial: yup.string().trim().required("La razón social es requerida"),

// })

// export const DespatchValidate = yup.object().shape({
//     tipoDoc:   yup.string().trim().required("El Tipo de documento es requerido"),
//     serie:    yup.string().trim().required("El Número de serie es requerido"),
//     correlativo: yup.string().trim().required("El correlativo es requerida"),
//     fechaEmision: yup.date().required("la Fecha de emision es requerida")
// })

export const DestinatarioSchema = object({
  /* tipoDoc: yup.string().required('Debe elegir un tipo de documento').trim(),
  numDoc: yup.string().required('Debe escribir un Número de documento'),
  rznSocial: yup.string().required('Debe escribir una Razón social').trim() */
  tipoDoc: yup
    .string()
    .required("Destinatario: Debe elegir el Tipo de Documento")
    .trim(),
  numDoc: yup
    .string()
    .required("Destinatario: Debe escribir un Número de documento")
    .when("tipoDoc", {
      is: "1", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          8,
          ({ length }) =>
            `Destinatario: El campo Número de documento debe tener ${length} caracteres`
        ),
    })
    .when("tipoDoc", {
      is: "6", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          11,
          ({ length }) =>
            `Destinatario: El campo Número de documento debe tener ${length} caracteres`
        ),
      otherwise: (schema) => schema,
    }),
  rznSocial: yup
    .string()
    .required("Destinatario: Debe escribir una razón social")
    .trim(),
  direccion:yup.string().notRequired(),
  ubigeo:yup.string().notRequired(),
});

export const CompradorSchema = object({
  /* tipoDoc: yup.string().required('Debe elegir un tipo de documento').trim(),
  numDoc: yup.string().required('Debe escribir un Número de documento'),
  rznSocial: yup.string().required('Debe escribir una Razón social').trim() */
  //tipoDoc: yup.string().required('Comprador: Debe elegir el Tipo de Documento').trim(),
  numDoc: yup
    .string()
    .notRequired()
    .when("tipoDoc", {
      is: "1", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          8,
          ({ length }) =>
            `Comprador: El campo Número de documento debe tener ${length} caracteres`
        ),
    })
    .when("tipoDoc", {
      is: "6", // alternatively: (val) => val == true
      then: (schema) =>schema.length(11,({ length }) =>`Comprador: El campo Número de documento debe tener ${length} caracteres`),
      otherwise: (schema) => schema,
    }).optional(),
  rznSocial: yup
    .string()
    .when("numDoc",{
      is:(numDoc) => numDoc && numDoc.length >0,
      then: (schema) => schema.required('Comprador: Si Número de documento existe, debe escribir una Razón Social'),
    })
    
    
});


// export interface dniData {
//   dni: string;
//   apellidoPaterno: string;
//   apellidoMaterno: string;
//   nombres: string;
// }

// export interface rucData {
//   ruc: string;
//   razonSocial: string;
//   nombreComercial: string;
//   direccion?: string;
// }

// export interface dataFound {

//   dniData?: dniData | null;
//   rucData?: rucData | null;
// }

export const DniDataSchema = object({
  dni: yup.string().notRequired(),
  apellidoPaterno: yup.string().notRequired(),
  apellidoMaterno: yup.string().notRequired(),
  nombres: yup.string().notRequired(),
})

export const RucDataSchema = object({
  ruc: yup.string().notRequired(),
  razonSocial: yup.string().notRequired(),
  nombreComercial: yup.string().notRequired(),
  direccion: yup.string().notRequired().optional(),
})


export const DataFoundTest = object({
  dniData:DniDataSchema,
  rucData:RucDataSchema
})

export const DestinatarioTest = object({
  /* tipoDoc: yup.string().required('Debe elegir un tipo de documento').trim(),
  numDoc: yup.string().required('Debe escribir un Número de documento'),
  rznSocial: yup.string().required('Debe escribir una Razón social').trim() */
  tipoDoc: yup
    .string()
    .required("Destinatario: Debe elegir el Tipo de Documento")
    .trim(),
  numDoc: yup
    .string()
    .required("Destinatario: Debe escribir un Número de documento")
    .when("tipoDoc", {
      is: "1", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          8,
          ({ length }) =>
            `Destinatario: El campo Número de documento debe tener ${length} caracteres`
        ),
    })
    .when("tipoDoc", {
      is: "6", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          11,
          ({ length }) =>
            `Destinatario: El campo Número de documento debe tener ${length} caracteres`
        ),
      otherwise: (schema) => schema,
    }),
  rznSocial: yup
    .string()
    .required("Destinatario: Debe escribir una razón social")
    .trim(),
  direccion:yup.string().notRequired(),
  ubigeo:yup.string().notRequired(),
});

export const DocumentTesting = yup.object().shape({
  serie: yup
    .string()
    .trim()
    .required(
      "Doc. Principal: Debe elegir  o escribir una Serie para el documento"
    ),
  correlativo: yup
    .number()
    .required("Doc. Principal: Debe escribir un correlativo"),
  fechaEmision: yup.string().required("Doc. Principal: Debe elegir una fecha"),
  observacion: yup.string().optional(),
  destinatario: DestinatarioTest,
});

// export interface Direccion {
//   ubigeo:    string;
//   direccion: string;
//   codlocal:  string;
//   ruc:       string;
// }

export const PartidaSchema = yup.object().shape({
  ubigeo:yup.string().trim().required('Punto de partida: Debe Elegir un ubigeo'),
  direccion:yup.string().trim().required('Punto de partida: Debe escribir una dirección'),
  codlocal:yup.string().required('Punto de partida: Debe escribir el código de local').matches(/^[0-9]+$/, "Punto de partida: Solo debe escribir números").min(4,'Punto de partida: Debe tener exactamente 4 digitos').max(4,'Punto de partida: Debe tener exactamente 4 digitos'),
  ruc:yup.string().required('Punto de partida: Debe escribir un RUC')
})

export const LlegadaSchema = yup.object().shape({
  ubigeo:yup.string().trim().required('Punto de llegada: Debe Elegir un ubigeo'),
  direccion:yup.string().trim().required('Punto de llegada: Debe escribir una dirección'),
  codlocal:yup.string().required('Punto de llegada: Debe escribir el código de local').matches(/^[0-9]+$/, "Punto de llegada: Solo debe escribir números").min(4,'Punto de llegada: Debe tener exactamente 4 digitos').max(4,'Punto de llegada: Debe tener exactamente 4 digitos'),
  ruc:yup.string().required('Punto de llegada: Debe escribir un RUC')
})

export const PuertoSchema = yup.object().shape({
  codigo:yup.string().trim().required('Debe elegir un puerto'),
})

export const AeropuertoSchema = yup.object().shape({
  codigo:yup.string().trim().required('Debe elegir un aeropuerto'),
})

export const VehiculoSchema = yup.object().shape({
  // placa:yup.string().trim().required('Vehiculo: Debe escribir una placa'),
  id:yup.number().notRequired(),
  placa:yup.string().trim().notRequired(),
  nroCirculacion:yup.string().notRequired(),
  codEmisor:yup.string().notRequired(),
  nroAutorizacion:yup.string().notRequired(),
  fav:yup.boolean(),
  isCompany:yup.boolean(),
  nombreCorto:yup.string()
  .when("fav", {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema.required('Cuando Favorito está activo, debe colocar un nombre corto'),
    otherwise:(schema)=>schema.nullable()
  })

})

export const ChoferSchema = yup.object().shape({
  tipo:yup.string().trim().required('Debe elegir un tipo de conductor'),
  tipoDoc:yup.string().trim().required('Debe elegir un tipo de documento'),
  nroDoc:yup.string().trim().required('Debe escribir un Nro de documento'),
  nombres:yup.string().trim().required('Debe escribir los nombres del conductor'),
  apellidos:yup.string().trim().notRequired(),
  licencia:yup.string().trim().required('Debe escribir el número de licencia')
})


export const ConductorSchema = yup.object().shape({
  tipoDoc:yup.string().trim().required('Debe elegir un tipo de documento'),
  nroDoc:yup.string().trim().required('Debe escribir un Nro de documento'),
  nombres:yup.string().trim().required('Debe escribir los nombres del conductor'),
  apellidos:yup.string().trim().notRequired(),
  licencia:yup.string().trim().required('Debe escribir el número de licencia'),
  fav:yup.boolean(),
  isCompany:yup.boolean(),
  nombreCorto:yup.string()
  .when("fav", {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema.required('Cuando Favorito está activo, debe colocar un nombre corto'),
    otherwise:(schema)=>schema.nullable()
  })
})

export const PuntoEmisionSchema = yup.object().shape({
  id:yup.number().notRequired(),
  codigo:yup.string().required('Debe escribir un Código'),
  nombre:yup.string().required('Debe escribir un Nombre'),
  codLocal:yup.string(),
  direccion:yup.string(),
  ruc:yup.string(),
})




export const EnvioSchema = yup.object().shape({
  codTraslado:yup.string().trim().required('Datos de Traslado: Debe elegir un motivo de traslado').optional(),
  desTraslado:yup.string(),
  pesoTotal:yup.number().required('Datos de Traslado: Debe escribir el peso total'),
  fecTraslado:yup.string().trim().required('Datos de Traslado: Debe elegir una fecha de traslado')
              .test('fecTraslado','Datos de Traslado: La fecha de traslado debe ser mayor a la fecha de Emision del documento',function(fecTraslado){
                const arraySchema = this.from;
                const getFormatedArraySchema = arraySchema.map(item=> item.value)
                const schema = getFormatedArraySchema.find(item=> item.fechaEmision);
                const fechaEmision = schema?.fechaEmision

                if(fecTraslado && fechaEmision){
                  const parseFechaEmision = new Date(fechaEmision)
                  const parseFecTraslado = new Date(fecTraslado)
                  return parseFecTraslado > parseFechaEmision
                }
                return true
              }),
  numBultos:yup.number().required('Datos de Traslado: Debe ingresar el número de bultos'),
  modTraslado:yup.string().trim().required('Datos de Traslado: Debe elegir la modalidad del traslado'),
  undPesoTotal:yup.string().trim().required('Datos de Traslado: Debe elegir una unidad de medida'),
  indicadores: yup.array()
  .when(['codTraslado'], {
    is:(codTraslado:string)=>{
      if(codTraslado!=='02'){
        return true
      }
    },
    then:(schema)=> schema.min(1,`Indicadores de Traslado: Debes agregar por lo menos 1 indicador para el Motivo de traslado`),
    otherwise:(schema)=> schema.max(0,`Indicadores de Traslado: No debe existir indicadores agregados para el Motivo de traslado`)
  }),
  // min(1,'Indicadores de traslado: Debes agregar por lo menos 1 indicador'),
  partida:PartidaSchema,
  llegada:LlegadaSchema,
  contenedores: yup
  .array()
  .notRequired()
  .when(['codTraslado'], {
    is:(codTraslado:string)=>{
      if(codTraslado==='08' || codTraslado==='09'){
        return true
      }
    },
    then:(schema)=> schema.min(1,`Contenedores: Debe existir por lo menos 1 contenedor agregado para el Motivo de traslado`),
    otherwise:(schema)=> schema.max(0,`Contenedores:No debe existir contenedores agregados para el Motivo de traslado`)
  }),
  puerto:PuertoSchema.notRequired(),
  aeropuerto:AeropuertoSchema.notRequired(),
  Vehiculo:VehiculoSchema,
  choferes:yup.array(ChoferSchema)
  .min(1,'debe elegir 1 Chofer'),
})


// export interface AddDoc {
    
//   tipoDesc: string;
//   tipo:     string;
//   nro:      string;
//   emisor:   string;
// }


export const AddDocSchema = yup.object().shape({
  tipo:yup.string().trim().required('Debe elegir un tipo de comprobante'),
  // nro:yup.string().trim().required('Debe escribir un Nro de comprobante').matches(/^([FB][a-zA-Z0-9]{3}-\d{1}\d{0,7})$/, "Debe escribir igual que el ejemplo"),
  nro:yup.string().trim().required('Debe escribir un Nro de comprobante'),
  emisor:yup.string().trim().required('Debe escribir el RUC del emisor'),
  tipoDesc:yup.string().trim().required('Debe escribir la descripción del tipo de documento')
})

export const ProductoSchema = yup.object().shape({
  codigo: yup.string().trim().required('Debe escribir el código de producto'),
  codProdSunat: yup.string().trim().notRequired(),
  descripcion: yup.string().trim().required('Debe escribir la descripción del producto'),
  unidad:yup.string().trim().required('Debe elegir la unidad de medida'),
  fav:yup.boolean().notRequired(),
  nombreCorto:yup.string()
  .when("fav", {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema.required('Cuando Favorito está activo, debe colocar un nombre corto'),
    otherwise:(schema)=>schema.nullable()
  })

});


export const PersonaSchema = object({
  tipoDoc: yup
    .string()
    .required("Debe elegir el Tipo de Documento")
    .trim(),
  numDoc: yup
    .string()
    .required("Debe escribir un Número de documento")
    .when("tipoDoc", {
      is: "1", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          8,
          ({ length }) =>
            `El campo Número de documento debe tener ${length} caracteres`
        ),
    })
    .when("tipoDoc", {
      is: "6", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          11,
          ({ length }) =>
            `El campo Número de documento debe tener ${length} caracteres`
        ),
      otherwise: (schema) => schema,
    }),
  rznSocial: yup
    .string()
    .required("Debe escribir una razón social")
    .trim(),
  email:yup.string().nullable(),
  telephone:yup.string().nullable(),
  fav:yup.boolean(),
  isCompany:yup.boolean(),
  nombreCorto:yup.string()
  .when("fav", {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema.required('Cuando Favorito está activo, debe colocar un nombre corto'),
    otherwise:(schema)=>schema.nullable()
  })
  
});


export const TransportistaSchema = yup.object().shape({
  tipoDoc:yup.string().trim().required('Debe elegir un tipo de documento'),
  numDoc:yup.string().trim().required('Debe escribir un Nro de documento'),
  rznSocial:yup.string().trim().required('Debe escribir la Razón social'),
  fav:yup.boolean(),
  nombreCorto:yup.string()
  .when("fav", {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema.required('Cuando Favorito está activo, debe colocar un nombre corto'),
    otherwise:(schema)=>schema.nullable()
  })
})


export const DetailSchema = yup.object().shape({
  codigo:yup.string().trim().required('Debe tener un código de producto'),
  descripcion:yup.string().trim().required('Debe escribir la descripción del producto'),
  unidad:yup.string().trim().required('Debe escribir una Unidad de medida'),
  cantidad:yup.number().required('Debe escribir una Cantidad'),
  codProdSunat:yup.string().trim().notRequired(),
  atributos:yup.array().notRequired(),
})

export const LoginSchema = yup.object().shape({
  password:yup.string().trim().required('Debe escribir la contraseña'),
  documento:yup.string().required('Debe escribir un numero de documento'),
  id_empresa:yup.number().required('Debe elegir una empresa')
})

export const RegisterSchema = yup.object().shape({
  name:yup.string().trim().required('Debe escribir el Usuario / Nro. Documento'),
  password:yup.string().trim().required('Debe escribir la contraseña'),
  email:yup.string().required('Debe escribir un email'),
  documento:yup.string().required('Debe escribir un numero de documento'),
  id_empresa:yup.number().required('Debe elegir una empresa')
})

export const NumeracionSchema = yup.object().shape({
  id:yup.number().notRequired(),
  nombre:yup.string().trim().required('Debe escribir un nombre'),
  serie:yup.string().trim().required('Debe escribir una serie').test('serieDoc','Respeta el patron T@@@',function(value){
    const regexp =/^[Tt][a-zA-Z0-9]{3}$/;
    const ejecutar = regexp.test(value);
    return ejecutar;
  }),
  numeroActual:yup.number(),
  id_puntoemision:yup.number().notRequired()
});

export const SunatParamsSchema = yup.object().shape({
  client_id:yup.string().trim().required('Debe escribir un id de cliente SUNAT'),
  client_secret:yup.string().trim().required('Debe escribir la clave secreta de cliente SUNAT'),
  username:yup.string().trim().required('Debe escribir el usuario SUNAT'),
  password:yup.string().trim().required('Debe escribir la clave del usuario SUNAT'),
  scope:yup.string().trim().required('Debe escribir el SCOPE'),
  grant_type:yup.string().trim().required('Debe escribir en el campo'),
  env:yup.string().trim().required('Debe elegir el tipo de ambiente'),
  endpointurl:yup.string().trim().required('Debe escribir el endpoint de envio'),
  certificado:yup.string(),
  clavecertificado:yup.string().trim().required('Debe escribir la clave del certificado'),
  urlsend:yup.string().trim().required('Debe escribir la url de envio'),
  urlconsult:yup.string().trim().required('Debe escribir la url de consulta'),
})


export const DocumentValidateSchema = yup.object().shape({
  serie: yup
    .string()
    .trim()
    .required(
      "Doc. Principal: Debe elegir  o escribir una Serie para el documento"
    ),
  correlativo: yup
    .number()
    .required("Doc. Principal: Debe escribir un correlativo"),
  fechaEmision: yup.string().required("Doc. Principal: Debe elegir una fecha de emisión del comprobante"),
  observacion: yup.string().optional(),
  destinatario: DestinatarioSchema,
  comprador: CompradorSchema.optional().notRequired(),
  envio: EnvioSchema,
  addDocs:yup.array(AddDocSchema)
  .min(1,'debe elegir 1 Doc Add'),
  details:yup.array(DetailSchema)
  .min(1,'debe elegir 1 Detalle'),
})

// export interface Envio {
    
//   codTraslado:   string;
//   desTraslado:   string;
//   indTransbordo?: string|null;
//   indicadores?:   string[];
//   pesoItems?:     number|null;
//   sustentoPeso?:  string|null;
//   pesoTotal:     number;
//   undPesoTotal:  string;
//   numBultos:     number;
//   contenedores?:  string[];
//   choferes?:      Choferes[]|null;//Listo
//   modTraslado:   string;
//   fecTraslado:   string;
//   puerto?:        Puerto|null;//Listo
//   aeropuerto?:    Puerto|null;//Listo
//   transportista?: Transportista|null; //Listo
//   vehiculo?:      Vehiculo; //listo
//   llegada?:       Direccion; //listo
//   partida?:       Direccion; //listo
// }

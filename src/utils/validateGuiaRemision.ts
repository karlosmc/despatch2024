import * as yup from "yup";
import { object } from "yup";
import rucValido from "../helpers/Validaciones";


export const DestinatarioSchema = object({
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
        ).test('rucValido','Destinatario: RUC INVALIDO',function(value){
          const isValid = rucValido(parseInt(value))
          return isValid;
        }),
      otherwise: (schema) => schema,
    }),
  rznSocial: yup
    .string()
    .required("Destinatario: Debe escribir una razón social")
    .trim(),
});

export const CompradorSchema = object({
  tipoDoc: yup
  .string()
  .required("Comprador: Debe elegir el Tipo de Documento")
  .trim(),
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
      then: (schema) =>schema.length(11,({ length }) =>`Comprador: El campo Número de documento debe tener ${length} caracteres`)
      .test('rucValido','Comprador: RUC INVALIDO',function(value){
        const isValid = rucValido(parseInt(value))
        return isValid;
      }),
      otherwise: (schema) => schema,
    }).optional(),
  rznSocial: yup
    .string()
    .when("numDoc",{
      is:(numDoc) => numDoc && numDoc.length >0,
      then: (schema) => schema.required('Comprador: Si Número de documento existe, debe escribir una Razón Social'),
    })
});

export const TerceroSchema = object({
  tipoDoc: yup
  .string()
  // .required("Proveedor: Debe elegir el Tipo de Documento")
  // .trim()
  ,
  numDoc: yup
    .string()
    .notRequired()
    .when("tipoDoc", {
      is: "1", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          8,
          ({ length }) =>
            `Proveedor: El campo Número de documento debe tener ${length} caracteres`
        ),
    })
    .when("tipoDoc", {
      is: "6", // alternatively: (val) => val == true
      then: (schema) =>schema.length(11,({ length }) =>`Proveedor: El campo Número de documento debe tener ${length} caracteres`)
      .test('rucValido','Proveedor: RUC INVALIDO',function(value){
        const isValid = rucValido(parseInt(value))
        return isValid;
      }),
      otherwise: (schema) => schema,
    }).optional(),
  rznSocial: yup
    .string()
    .when("numDoc",{
      is:(numDoc) => numDoc && numDoc.length >0,
      then: (schema) => schema.required('Proveedor: Si Número de documento existe, debe escribir una Razón Social'),
    })
});

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


function ValidateCodTraslado(value:string,esquema:any){
  
  const arraySchema = esquema;
  console.log(arraySchema)
  const getFormatedArraySchema = arraySchema.map(item=> item.value)
  console.log(getFormatedArraySchema)
  const schemaEnvio = getFormatedArraySchema.find(item=> item.envio)?.envio;

  console.log(schemaEnvio?.codTraslado,value)
  return schemaEnvio?.codTraslado===value;
  
}

export const PartidaSchema =yup.object().shape({
  ubigeo:yup.string().trim().required('Punto de partida: Debe Elegir un ubigeo'),
  direccion:yup.string().trim().required('Punto de partida: Debe escribir una dirección'),
  codLocal:yup.string().required('Punto de partida: Debe escribir el código de local').matches(/^[0-9]+$/, "Punto de partida: Solo debe escribir números").min(4,'Punto de partida: Debe tener exactamente 4 digitos').max(4,'Punto de partida: Debe tener exactamente 4 digitos'),
  ruc:yup.string()
})


export const PuntosSchema =yup.object().shape({
  ubigeo:yup.string().trim().required('Punto de partida: Debe Elegir un ubigeo'),
  direccion:yup.string().trim().required('Punto de partida: Debe escribir una dirección'),
  codLocal:yup.string().required('Punto de partida: Debe escribir el código de local').matches(/^[0-9]+$/, "Punto de partida: Solo debe escribir números").min(4,'Punto de partida: Debe tener exactamente 4 digitos').max(4,'Punto de partida: Debe tener exactamente 4 digitos'),
  ruc:yup.string(),
  fav:yup.boolean(),
  isCompany:yup.boolean(),
  nombreCorto:yup.string()
})

export const PartidaSchemaError =yup.object().shape({
  ubigeo:yup.string().trim().required('Punto de partida: Debe Elegir un ubigeo'),
  direccion:yup.string().trim().required('Punto de partida: Debe escribir una dirección'),
  // codlocal:yup.string().required('Punto de partida: Debe escribir el código de local').matches(/^[0-9]+$/, "Punto de partida: Solo debe escribir números").min(4,'Punto de partida: Debe tener exactamente 4 digitos').max(4,'Punto de partida: Debe tener exactamente 4 digitos'),
  codLocal: yup.string()
  .test('onlyNumbers','Punto de partida: Solo debe escribir números',function(value){
        const esquema = this.from;
        const getFormatedArraySchema = esquema.map(item=> item.value)
        console.log(getFormatedArraySchema)
        const schemaEnvio = getFormatedArraySchema.find(item=> item.envio)?.envio;
        

        if(ValidateCodTraslado('04',esquema)){
          // console.log('entro')
          const fourNumbers = new RegExp(/^[0-9]+$/);
          // console.log(fourNumbers.test(value))
          return !fourNumbers.test(value)
        }
        return true;
    }),
  // .test('exacto','Debe tener exactamente 4 digitos',function(value){
  //   if(ValidateCodTraslado('04',this)){
  //     return value?.length===4
  //   }
  //   return true;
  // }),
  
  // .test('onlyNumbers','Punto de partida: Solo debe escribir números',function(value){
  //   const arraySchema = this.from;
  //   const getFormatedArraySchema = arraySchema.map(item=> item.value)
  //   // console.log(getFormatedArraySchema)
  //   const schemaEnvio = getFormatedArraySchema.find(item=> item.envio)?.envio;
  //   if(schemaEnvio?.codTraslado!=='04'){
  //     const fourNumbers = new RegExp(/^[0-9]+$/);
  //     return fourNumbers.test(value)
  //   }
  //   return false;
  // .length(4, 'Punto de partida: Debe tener exactamente 4 dígitos'),
  
    // .when('$envio', (envio: any, schema: yup.StringSchema<string>) => {
    //   if (envio.codTraslado !== '04') {
    //     return schema.required('Punto de partida: Debe escribir el código de local')
    //       .matches(/^[0-9]+$/, "Punto de partida: Solo debe escribir números")
    //       .length(4, 'Punto de partida: Debe tener exactamente 4 dígitos');
    //   } else {
    //     return schema.notRequired();
    //   }
    // }),
  ruc:yup.string().required('Punto de partida: Debe escribir un RUC')
})

export const LlegadaSchema = yup.object().shape({
  ubigeo:yup.string().trim().required('Punto de llegada: Debe Elegir un ubigeo'),
  direccion:yup.string().trim().required('Punto de llegada: Debe escribir una dirección'),
  codLocal:yup.string().required('Punto de llegada: Debe escribir el código de local').matches(/^[0-9]+$/, "Punto de llegada: Solo debe escribir números").min(4,'Punto de llegada: Debe tener exactamente 4 digitos').max(4,'Punto de llegada: Debe tener exactamente 4 digitos'),
  ruc:yup.string()
})

export const PuertoSchema = yup.object().shape({
  codigo:yup.string().trim().required('Debe elegir un puerto'),
})

export const AeropuertoSchema = yup.object().shape({
  codigo:yup.string().trim().required('Debe elegir un aeropuerto'),
})

export const SecundariosSchema = yup.object().shape({
  // placa:yup.string().trim().required('Vehiculo: Debe escribir una placa'),
  placa:yup.string().trim().notRequired(),
  nroCirculacion:yup.string().notRequired(),
  codEmisor:yup.string().notRequired(),
  nroAutorizacion:yup.string().notRequired(),
  
})

export const VehiculoSchema = yup.object().shape({
  // placa:yup.string().trim().required('Vehiculo: Debe escribir una placa'),
  placa:yup.string().trim().required(),
  nroCirculacion:yup.string().notRequired(),
  codEmisor:yup.string().notRequired(),
  nroAutorizacion:yup.string().notRequired(),
  secundarios:yup.array(SecundariosSchema).notRequired()
})

export const ChoferSchema = yup.object().shape({
  tipo:yup.string().trim().required('Chofer: Debe elegir un tipo de conductor'),
  tipoDoc:yup.string().trim().required('Chofer: Debe elegir un tipo de documento'),
  nroDoc:yup.string().trim().required('Chofer: Debe escribir un Nro de documento'),
  nombres:yup.string().trim().required('Chofer: Debe escribir los nombres del conductor'),
  apellidos:yup.string().trim().notRequired(),
  licencia:yup.string().trim().required('Chofer: Debe escribir el número de licencia')
})

export const EnvioSchema = yup.object().shape({
  
  codTraslado:yup.string().trim().required('Datos de Traslado: Debe elegir un motivo de traslado'),
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
  // .when(['codTraslado'], {
  //   is:(codTraslado:string)=>{
  //     if(codTraslado!=='02'){
  //       return true
  //     }
  //   },
  //   then:(schema)=> schema.min(1,`Indicadores de Traslado: Debes agregar por lo menos 1 indicador para el Motivo de traslado`),
  //   otherwise:(schema)=> schema.max(0,`Indicadores de Traslado: No debe existir indicadores agregados para el Motivo de traslado`)
  // }),
  
})

export const AddDocSchema = yup.object().shape({
  tipo:yup.string().trim().required('Debe elegir un tipo de comprobante'),
  // nro:yup.string().trim().required('Debe escribir un Nro de comprobante').matches(/^([FB][a-zA-Z0-9]{3}-\d{1}\d{0,7})$/, "Debe escribir igual que el ejemplo"),
  nro:yup.string().trim().required('Debe escribir un Nro de comprobante')
  .when('tipo',{
    is:(tipo:string)=>{
      if(tipo==='03' || tipo==='01'){
        return true
      }
    },
    then:(schema)=>schema.test('patroDocumento','Respeta el patron del documento',function(value){
      const regexp =/^[FB-fb][a-zA-Z0-9]{3}-\d+$/;
  
      const ejecutar = regexp.test(value);
      
      return ejecutar;
    }),
    otherwise:(schema)=>schema.required()
  })
  ,
  emisor:yup.string().trim().required('Debe escribir el RUC del emisor'),
  tipoDesc:yup.string().trim().required('Debe escribir la descripción del tipo de documento')
})

export const DetailSchema = yup.object().shape({
  codigo:yup.string().trim().required('Debe tener un código de producto'),
  descripcion:yup.string().trim().required('Debe escribir la descripción del producto'),
  unidad:yup.string().trim().required('Debe escribir una Unidad de medida'),
  cantidad:yup.number().positive('La cantidad debe ser mayor que { 0 }').required('Debe escribir una Cantidad'),
  codProdSunat:yup.string().trim().notRequired(),
  atributos:yup.array().notRequired(),
})

export const DatosGeneralesSchema= yup.object().shape({
  serie: yup
  .string()
  .trim()
  .required(
    "Doc. Principal: Debe elegir  o escribir una Serie para el documento"
  ),
  correlativo: yup
    .number().typeError('Solo debe contener números')
    .positive('Debe contener números positivos')
    .required("Doc. Principal: Debe escribir un correlativo")
    .default(999),  
  fechaEmision: yup.string().required("Doc. Principal: Debe elegir una fecha de emisión del comprobante"),
});

export const TransportistaSchema = yup.object().shape({
  tipoDoc: yup
    .string()
    .required("Transportista: Debe elegir el Tipo de Documento")
    .trim(),
  numDoc: yup
    .string()
    .required("Transportista: Debe escribir un Número de documento")
    .when("tipoDoc", {
      is: "6", // alternatively: (val) => val == true
      then: (schema) =>
        schema.length(
          11,
          ({ length }) =>
            `Transportista: El campo Número de documento debe tener ${length} caracteres`
        ),
      otherwise: (schema) => schema,
    }),
  rznSocial: yup
    .string()
    .required("Transportista: Debe escribir una razón social")
    .trim(),
  nroMtc:yup.string().notRequired()
})

export const GuiaRemisionSchema = yup.object().shape({
 
  datosGenerales:DatosGeneralesSchema,
  destinatario: DestinatarioSchema,
  // comprador: CompradorSchema.optional().notRequired(),
  proveedor: TerceroSchema.optional().notRequired(),
  envio: EnvioSchema,
  addDocs:yup.array(AddDocSchema),
  // .min(1,'Debe agregar por lo menos { 1 } Documento adicional'),
  details:yup.array(DetailSchema)
  .min(1,'Debe agregar por lo menos {1} Detalle'),
  vehiculo:VehiculoSchema,
  choferes:yup.array(ChoferSchema),
//  choferes:yup.array(ChoferSchema).min(1, "Debe agregar por lo menos 1 Chofer").max(3,"Solo se permite {1} Principal y {2} Secundarios"),

  partida:PartidaSchema,
  llegada:LlegadaSchema,
  
  transportista:yup.object()
  .test('Transportisa Requerido','Debe proporcionar la Información del transportista',
    function(value){
      const { envio } = this.parent;
      const {modTraslado}= envio;
      if(modTraslado==='01'){
        return TransportistaSchema.isValid(value)
      }
      return true
    }
  ),
  observacion:yup.string().notRequired()
})





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
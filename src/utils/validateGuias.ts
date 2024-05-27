import * as yup from 'yup'



export const DocumentosGeneralesSchema = yup.object().shape({
  serie: yup
    .string()
    .trim()
    .required(
      "Debe elegir  o escribir una Serie para el documento"
    ),
  correlativo: yup
    .number()
    .required("Debe escribir un correlativo"),
  observacion: yup.string().optional(),
  fechaEmision: yup.string().required("Debe elegir una fecha de emisión del comprobante"),
  codTraslado:yup.string().required(),
  desTraslado:yup.string().required(),
  // fecTraslado:yup.string().trim().required('Datos de Traslado: Debe elegir una fecha de traslado')
  //             .test('fecTraslado','Datos de Traslado: La fecha de traslado debe ser mayor a la fecha de Emision del documento',function(fecTraslado){
  //               const {fechaEmision} = this.parent;
  //               if(fecTraslado && fechaEmision){
  //                 const parseFechaEmision = new Date(fechaEmision)
  //                 const parseFecTraslado = new Date(fecTraslado)
  //                 return parseFecTraslado > parseFechaEmision
  //               }
  //               return true

  //             }),
  
})


export const DestinatarioSchema = yup.object({
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

export const CompradorSchema = yup.object({
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
      is:(numDoc) => numDoc && numDoc.length>0,
      then: (schema) => schema.required('Comprador: Si Número de documento existe, debe escribir una Razón Social'),
    })
    
    
});

export const DatosPersonasSchema = yup.object().shape({
  destinatario:DestinatarioSchema,
  comprador:CompradorSchema.optional()
})

export const DatosEnvioSchema = yup.object().shape({
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

})


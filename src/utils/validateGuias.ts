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
  fecTraslado:yup.string().trim().required('Datos de Traslado: Debe elegir una fecha de traslado')
              .test('fecTraslado','Datos de Traslado: La fecha de traslado debe ser mayor a la fecha de Emision del documento',function(fecTraslado){
                const {fechaEmision} = this.parent;
                if(fecTraslado && fechaEmision){
                  const parseFechaEmision = new Date(fechaEmision)
                  const parseFecTraslado = new Date(fecTraslado)
                  return parseFecTraslado > parseFechaEmision
                }
                return true

              }),
  
})



import * as yup from 'yup'
export const ProductoSchema = yup.object().shape({
  codigo: yup.string().trim().required('Debe escribir el código de producto'),
  codProdSunat: yup.string().trim().notRequired(),
  descripcion: yup.string().trim().required('Debe escribir la descripción del producto'),
  unidad:yup.string().trim().required('Debe elegir la unidad de medida'),
  fav:yup.boolean().notRequired()
});
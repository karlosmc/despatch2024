import * as yup from 'yup'

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
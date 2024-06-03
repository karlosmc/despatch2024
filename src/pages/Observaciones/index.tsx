import { Button, TextField } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'


interface ObservacionesForm {
  observaciones: string;
  onChange:(observaciones:string)=>void
}



const ObservacionesTextField = ({observaciones,onChange}:ObservacionesForm) => {

  const formik = useFormik({
    initialValues: { observacion: observaciones },
    validationSchema: yup.object().shape({ observacion: yup.string().notRequired() }),
    onSubmit: () => {
    }
  })

  const handleChange=()=>{
    onChange(formik.values.observacion)
  }

  return (
    <>
      <TextField
        sx={{ mt: 2 }}
        fullWidth
        label='Escriba las observaciones'
        name="observacion"
        value={formik.values.observacion}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.observacion && Boolean(formik.errors.observacion)}
        helperText={formik.touched.observacion && formik.errors.observacion}
        multiline
        rows={5}
      />
      <Button color='success' variant='outlined' sx={{mt:1}} onClick={handleChange} >Confirmar</Button>
    </>
  )
}

export default ObservacionesTextField
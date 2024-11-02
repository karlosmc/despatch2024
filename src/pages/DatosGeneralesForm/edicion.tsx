
import { FormControl, InputLabel, MenuItem, Select, TextField,  Box } from '@mui/material'
import { useFormik } from 'formik';
import { DatosGenerales } from '../../types/guias/guiaremision.interface';
import { useEffect } from 'react';
import { DatosGeneralesSchema } from '../../utils/validateGuiaRemision';





interface DatosGeneralesFormProps {
  onChange: (datosGenerales: DatosGenerales) => void;
  puntoEmision:number;
  datosGeneralesValues: DatosGenerales;
}

const DatosGeneralesFormEdicion = ({ onChange, datosGeneralesValues }: DatosGeneralesFormProps) => {

  // console.log(puntosEmision)

  // console.log(datosGeneralesValues)


  const formik = useFormik({
    initialValues: datosGeneralesValues,
    validationSchema: DatosGeneralesSchema,
    onSubmit: (_) => { }
  })

  useEffect(() => {
    // console.log(formik.values);
    onChange(formik.values);
  }, [formik.values]);


useEffect(()=>{
  if(datosGeneralesValues.serie!==''){
    // console.log('entro')
    datosGeneralesValues.fechaEmision=datosGeneralesValues.fechaEmision.split(' ')[0];
    formik.setValues(datosGeneralesValues)
  }
},[datosGeneralesValues])


  return (
    <Box
      display={"grid"}
      
      gridTemplateColumns={{ xs: "repeat(1fr)", sm: "repeat(2,1fr)" }}
      gap={1}
    >

      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">
          Tipo Documento
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Tipo Documento"
          value={"G"}
        >
          <MenuItem value="G">
            GUIA DE REMISION ELECTRONICA
          </MenuItem>
        </Select>
      </FormControl>


      <TextField
        size="small"
        fullWidth
        name="serie"
        value={formik.values.serie}
        type="text"
        label="Serie"
        InputProps={{ readOnly: true }}
        error={
          formik.touched.serie &&
          Boolean(formik.errors.serie)
        }
        onBlur={formik.handleBlur}
        helperText={
          formik.touched.serie && formik.errors.serie
        }
        onChange={formik.handleChange}
      />
  
      <TextField
        size="small"
        fullWidth
        name="correlativo"
        value={formik.values.correlativo}
        type="text"
        label="Número Documento"
        InputProps={{ readOnly: true }}
        error={
          formik.touched.correlativo &&
          Boolean(formik.errors.correlativo)
        }
        onBlur={formik.handleBlur}
        helperText={
          formik.touched.correlativo && formik.errors.correlativo
        }
        onChange={formik.handleChange}
      />

      <TextField
        fullWidth
        size="small"
        id="datetime-local"
        label="Fecha de Emision"
        name="fechaEmision"
        type="date"
        value={formik.values.fechaEmision}
        style={{ colorScheme: "dark" }}
        InputLabelProps={{
          shrink: true,
        }}
        error={
          formik.touched.fechaEmision &&
          Boolean(formik.errors.fechaEmision)
        }
        onBlur={formik.handleBlur}
        helperText={
          formik.touched.fechaEmision &&
          formik.errors.fechaEmision
        }
        onChange={formik.handleChange}
        InputProps={{ readOnly: true }}
      />

    </Box>
  )
}

export default DatosGeneralesFormEdicion

import { FormControl, InputLabel, MenuItem, Select, TextField, FormHelperText, Box } from '@mui/material'
import { useFormik } from 'formik';
import { DatosGenerales } from '../../types/guias/guiaremision.interface';
import { useEffect, useState } from 'react';
import { DatosGeneralesSchema } from '../../utils/validateGuiaRemision';
import clienteAxios from '../../config/axios';
import { numeracion } from '../../types/numeracion.interface';




interface DatosGeneralesFormProps {
  onChange: (datosGenerales: DatosGenerales) => void;
  puntoEmision:number;
  datosGeneralesValues: DatosGenerales;
}

const DatosGeneralesForm = ({ onChange, datosGeneralesValues,puntoEmision }: DatosGeneralesFormProps) => {

  // console.log(puntosEmision)
  const token = localStorage.getItem('AUTH_TOKEN');

  const [numeracion, setNumeracion] = useState<numeracion[]>([])



  const formik = useFormik({
    initialValues: datosGeneralesValues,
    validationSchema: DatosGeneralesSchema,
    onSubmit: (_) => { }
  })

  useEffect(() => {
    // console.log(formik.values);
    onChange(formik.values);
  }, [formik.values]);

  const getSeries = async () => {
    try {

      const { data, status } = await clienteAxios(`/api/numeracion/actualbypunto?id_puntoemision=${puntoEmision}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // console.log(data)
      if (status === 200) {
        setNumeracion(data?.data)
        // console.log(data)

      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
    }
  }


  useEffect(()=>{
    if(puntoEmision){
      getSeries()
      formik.setFieldValue('serie','');
      formik.setFieldValue('correlativo',0)
    }
    
  },[puntoEmision])

  useEffect(()=>{
    if(formik.values.serie!==''){
      const correlativo = numeracion.find(it=> it.serie===formik.values.serie);

      if(correlativo){

        
        
        formik.setFieldValue('correlativo',correlativo.numeroActual+1)
      }
      else{
        formik.setFieldValue('correlativo',0)
      }
    }
  },[formik.values.serie])


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

      <FormControl fullWidth size="small" error={formik.touched.serie && Boolean(formik.errors.serie)}>
        <InputLabel id="demo-simple-select-label">
          Serie
        </InputLabel>
        <Select
          fullWidth
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formik.values.serie}
          label="Serie"
          onChange={formik.handleChange}
          error={
            formik.touched.serie && Boolean(formik.errors.serie)
          }
          onBlur={formik.handleBlur}
          name="serie"
        >
          <MenuItem value={""}>...Debe Elegir una serie...</MenuItem>
          {
            numeracion?.map(num=>(
              <MenuItem value={num.serie} key={num.id}>{num.serie}</MenuItem>
            ))

          }
          
        </Select>
        <FormHelperText>{formik.touched.serie && formik.errors.serie}</FormHelperText>
      </FormControl>

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
      />

    </Box>
  )
}

export default DatosGeneralesForm
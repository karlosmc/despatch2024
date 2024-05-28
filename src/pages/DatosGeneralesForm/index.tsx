
import { Grid, FormControl, InputLabel, MenuItem, Select, TextField, FormHelperText } from '@mui/material'
import { useFormik } from 'formik';
import { DatosGenerales } from '../../types/guias/guiaremision.interface';
import { useEffect } from 'react';
import { DatosGeneralesSchema } from '../../utils/validateGuiaRemision';



interface DatosGeneralesFormProps {
  onChange: (datosGenerales: DatosGenerales) => void;
  datosGeneralesValues:DatosGenerales;
}

const DatosGeneralesForm = ({onChange,datosGeneralesValues}:DatosGeneralesFormProps) => {

  const formik = useFormik({
    initialValues: datosGeneralesValues,
    validationSchema: DatosGeneralesSchema,
    onSubmit: (_) => {}
  })

  useEffect(() => {
    // console.log(formik.values);
    onChange(formik.values);
  }, [formik.values]);
  
  return (
    <>
      <Grid item lg={4} xs={12}>
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
      </Grid>
      <Grid item lg={2} xs={6}>
        <FormControl fullWidth size="small" error={formik.touched.serie && Boolean(formik.errors.serie)}>
          <InputLabel id="demo-simple-select-label">
            Serie
          </InputLabel>
          <Select
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
            {/* <MenuItem value={serie}>{serie}</MenuItem> */}
            <MenuItem value={""}>...Debe Elegir una serie...</MenuItem>
            <MenuItem value={"T002"}>T002</MenuItem>
            <MenuItem value={"T003"}>T003</MenuItem>
          </Select>
          <FormHelperText>{formik.touched.serie && formik.errors.serie}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item lg={2} xs={6}>
        <TextField
          size="small"
          name="correlativo"
          value={formik.values.correlativo}
          type="text"
          label="Número Documento"
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
      </Grid>
      <Grid item lg={4} xs={12}>
        <TextField
          fullWidth
          size="small"
          id="datetime-local"
          label="Fecha de Emision"
          name="fechaEmision"
          type="datetime-local"
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
      </Grid>
    </>
  )
}

export default DatosGeneralesForm
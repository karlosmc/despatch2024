
import { FormControl, InputLabel, MenuItem, Select, TextField, FormHelperText, Box } from '@mui/material'
import { useFormik } from 'formik';
import { DatosGenerales, EnvioVehiculo } from '../../types/guias/guiaremision.interface';
import { useEffect, useState } from 'react';
import { DatosGeneralesSchema } from '../../utils/validateGuiaRemision';
import { numeracion } from '../../types/numeracion.interface';
import { NumeracionService } from '../../service/NumeracionService';




interface DatosGeneralesFormProps {
  onChange: (datosGenerales: DatosGenerales) => void;
  puntoEmision: number;
  datosGeneralesValues: DatosGenerales;
  onSelectSerie: (vehiculo: EnvioVehiculo) => void;
  editMode?: boolean;
}

const DatosGeneralesForm = ({ onChange, datosGeneralesValues, puntoEmision, onSelectSerie, editMode = false }: DatosGeneralesFormProps) => {

  // console.log(puntosEmision)

  const [numeracion, setNumeracion] = useState<numeracion[]>([])

  const fechaActual = new Date();
  const minDate = new Date(fechaActual.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const maxDate = new Date(fechaActual.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

      const { data } = await NumeracionService.getNumeracionByIdPuntoEmision(puntoEmision);
      setNumeracion(data);

    }
    catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    if(editMode) return;
    if (puntoEmision) {
      getSeries()
      formik.setFieldValue('serie', '');
      formik.setFieldValue('correlativo', 0)
    }

  }, [puntoEmision])

  useEffect(() => {

    if(editMode) return;
    if (formik.values.serie !== '') {
      const correlativo = numeracion.find(it => it.serie === formik.values.serie);

      if (correlativo) {
        formik.setFieldValue('correlativo', correlativo.numeroActual + 1)

        if (!correlativo.primario) {
          onSelectSerie({ placa: '', codEmisor: '', id: 0, nroAutorizacion: '', nroCirculacion: '', secundarios: [] })
          return
        }
        const Vehiculo: EnvioVehiculo = {
          ...correlativo.primario,
          secundarios: correlativo.secundario
        }
        onSelectSerie(Vehiculo)
      }
      else {
        formik.setFieldValue('correlativo', 0)
      }
    }
  }, [formik.values.serie])


  useEffect(() => {
    if (editMode) {
      formik.setFieldValue('serie', datosGeneralesValues.serie);
      formik.setFieldValue('correlativo', datosGeneralesValues.correlativo);
      formik.setFieldValue('fechaEmision', datosGeneralesValues.fechaEmision);
    }
  }, [editMode, datosGeneralesValues]);

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

      {
        editMode ?
          <TextField
            size="small"
            fullWidth
            name="correlativo"
            value={formik.values.serie}
            type="text"
            label="Número Documento"
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
          :
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
                numeracion?.map(num => (
                  <MenuItem value={num.serie} key={num.id}>{num.serie}</MenuItem>
                ))

              }

            </Select>
            <FormHelperText>{formik.touched.serie && formik.errors.serie}</FormHelperText>
          </FormControl>
      }

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
        inputProps={{
          min: minDate,
          max: maxDate
        }}
        InputProps={{ readOnly: editMode }}
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
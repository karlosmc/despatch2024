import { FavoritoService, TIPOS_FAVORITO, favoritoVigente } from '../../service/FavoritoService';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useNotification } from '../../context/notification.context';
import { vehiculo } from '../../types/vehiculo.interface';
import { VehiculoService } from '../../service/VehiculoService';

const EMISORES = [
  {
    Codigo: "",
    Nombre: "Elija un emisor autorizado (Opcional)",
    Abreviatura: "",
  },
  {
    Codigo: "01",
    Nombre:
      "Superintendencia Nacional de Control de Servicios de Seguridad, Armas, Municiones y Explosivos de Uso Civil",
    Abreviatura: "SUCAMEC",
  },
  {
    Codigo: "02",
    Nombre: "Dirección General de Medicamentos Insumos y Drogas",
    Abreviatura: "DIGEMID",
  },
  {
    Codigo: "03",
    Nombre: "Dirección General de Salud Ambiental",
    Abreviatura: "DIGESA",
  },
  {
    Codigo: "04",
    Nombre: "Servicio Nacional de Sanidad Agraria",
    Abreviatura: "SENASA",
  },
  {
    Codigo: "05",
    Nombre: "Servicio Nacional Forestal y de Fauna Silvestre",
    Abreviatura: "SERFOR",
  },
  {
    Codigo: "06",
    Nombre: "Ministerio de Transportes y Comunicaciones",
    Abreviatura: "MTC",
  },
  {
    Codigo: "07",
    Nombre: "Ministerio de la Producción",
    Abreviatura: "PRODUCE",
  },
  {
    Codigo: "08",
    Nombre: "Ministerio del Ambiente",
    Abreviatura: "MIN. AMBIENTE",
  },
  {
    Codigo: "09",
    Nombre: "Organismo Nacional de Sanidad Pesquera",
    Abreviatura: "SANIPES",
  },
  {
    Codigo: "10",
    Nombre: "Municipalidad Metropolitana de Lima",
    Abreviatura: "MML",
  },
  {
    Codigo: "11",
    Nombre: "Ministerio de Salud",
    Abreviatura: "MINSA",
  },
  {
    Codigo: "12",
    Nombre: "Gobierno Regional",
    Abreviatura: "GR",
  },
];

const VehiculoInitialValues: vehiculo = {
  placa: '',
  nroAutorizacion: '',
  nombreCorto: '',
  codEmisor: '',
  nroCirculacion: '',
  fav: false,
  isCompany: false,
  tracto: true,
  glp: false,
  id: 0,
}

const VehiculoFormSchema = yup.object().shape({
  placa: yup
    .string()
    .trim()
    .required('Escribe la placa')
    .test('placa', 'La placa debe tener 6 letras o números (ej. ABC-123)', (valor) =>
      (valor || '').replace(/[^A-Za-z0-9]/g, '').length === 6
    ),
  nroCirculacion: yup.string().nullable(),
  codEmisor: yup.string().nullable(),
  nroAutorizacion: yup
    .string()
    .nullable()
    .when('codEmisor', {
      is: (codEmisor: string) => Boolean(codEmisor),
      then: (schema) => schema.trim().required('Con emisor autorizado, escribe el número de autorización'),
    }),
  fav: yup.boolean(),
  isCompany: yup.boolean(),
  tracto: yup.boolean(),
  glp: yup.boolean(),
  nombreCorto: yup
    .string()
    .nullable()
    .when('fav', {
      is: true,
      then: (schema) => schema.trim().required('Para marcarlo como favorito, ponle un nombre corto'),
    }),
})

/** El backend puede mandar null en los textos: el formulario trabaja con cadenas. */
const aFormulario = (v?: vehiculo | null): vehiculo => ({
  ...VehiculoInitialValues,
  ...(v || {}),
  placa: v?.placa ?? '',
  nroCirculacion: v?.nroCirculacion ?? '',
  nroAutorizacion: v?.nroAutorizacion ?? '',
  codEmisor: v?.codEmisor ?? '',
  nombreCorto: v?.nombreCorto ?? '',
  fav: favoritoVigente(TIPOS_FAVORITO.vehiculo, v?.id, v?.fav),
  isCompany: Boolean(v?.isCompany),
  tracto: v?.tracto ?? true,
  glp: Boolean(v?.glp),
})

interface VehiculoFormProps {
  initialValue?: vehiculo | null;
  onConfirm: (vehiculo: vehiculo) => void;
  edit: boolean,
}

const ModalVehiculo = ({ initialValue, onConfirm, edit }: VehiculoFormProps) => {
  const { getError, getSuccess, getWarning } = useNotification()
  const [guardando, setGuardando] = useState(false)

  const guardar = async (values: vehiculo) => {
    // Evita un doble registro por doble clic.
    if (guardando) return
    setGuardando(true)
    try {
      const response = edit ? await VehiculoService.update(values) : await VehiculoService.save(values)
      const id = (response && typeof response === 'object' ? response.id : undefined) ?? values.id
      const motivoFav = await FavoritoService.sincronizar(TIPOS_FAVORITO.vehiculo, id, Boolean(values.fav), edit)

      getSuccess(edit ? `Vehículo ${values.placa} actualizado` : `Vehículo ${values.placa} registrado`)
      if (motivoFav) {
        // En el siguiente ciclo: el aviso de éxito usa el mismo snackbar y lo taparía.
        setTimeout(() => getWarning(`Se guardó, pero no se pudo actualizar tu favorito: ${motivoFav}`), 0)
      }
      onConfirm({ ...values, ...(response && typeof response === 'object' ? response : {}), id })
    } catch (error) {
      getError(typeof error === 'string' ? error : 'No se pudo guardar el vehículo')
    } finally {
      setGuardando(false)
    }
  }

  const formik = useFormik<vehiculo>({
    initialValues: aFormulario(initialValue),
    validationSchema: VehiculoFormSchema,
    onSubmit: (values) => {
      guardar({
        ...values,
        placa: values.placa.toUpperCase(),
        nombreCorto: (values.nombreCorto || '').toUpperCase(),
      })
    },
  });

  const { values, touched, errors } = formik
  const campo = (nombre: keyof vehiculo) => ({
    name: nombre,
    value: String(values[nombre] ?? ''),
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(touched[nombre] && errors[nombre]),
    helperText: touched[nombre] && errors[nombre] ? String(errors[nombre]) : undefined,
    size: 'small' as const,
    fullWidth: true,
    disabled: guardando,
    inputProps: { style: { textTransform: 'uppercase' as const } },
  })

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate sx={{ pt: 1, minWidth: { sm: 460 } }}>
      <Box display='grid' gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap={1.5}>
        <TextField
          {...campo('placa')}
          label='Placa'
          placeholder='ABC-123'
          autoFocus={!edit}
          disabled={guardando || edit}
        />
        <TextField {...campo('nroCirculacion')} label='Nro. circulación (TUC)' />

        <Box gridColumn='1 / -1'>
          <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>
            Tipo de unidad
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size='small'
            color='primary'
            value={values.tracto ? 'tracto' : 'carreta'}
            onChange={(_, nuevo) => nuevo && formik.setFieldValue('tracto', nuevo === 'tracto')}
            disabled={guardando}
          >
            <ToggleButton value='tracto'>Tracto / camión</ToggleButton>
            <ToggleButton value='carreta'>Cisterna / carreta</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <FormControl fullWidth size='small' sx={{ gridColumn: '1 / -1' }} disabled={guardando}>
          <InputLabel>Emisor autorizado (opcional)</InputLabel>
          <Select
            value={values.codEmisor || ''}
            name='codEmisor'
            label='Emisor autorizado (opcional)'
            onChange={formik.handleChange}
          >
            {EMISORES.map((emisor) => (
              <MenuItem key={emisor.Codigo} value={emisor.Abreviatura}>
                {emisor.Abreviatura ? `${emisor.Abreviatura} · ${emisor.Nombre}` : emisor.Nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {values.codEmisor && (
          <TextField {...campo('nroAutorizacion')} label='Nro. autorización' sx={{ gridColumn: '1 / -1' }} />
        )}

        <TextField
          {...campo('nombreCorto')}
          label='Nombre corto'
          helperText={
            touched.nombreCorto && errors.nombreCorto
              ? String(errors.nombreCorto)
              : 'Cómo lo verás en tus favoritos'
          }
          sx={{ gridColumn: '1 / -1' }}
        />
      </Box>

      <Box display='flex' flexDirection='column' mt={1.5}>
        <FormControlLabel
          control={<Switch checked={Boolean(values.glp)} onChange={(e) => formik.setFieldValue('glp', e.target.checked)} disabled={guardando} />}
          label='Cisterna de GLP'
        />
        <FormHelperText sx={{ mt: -0.75, ml: 6.5 }}>
          En la guía rápida, su placa es la sucursal para consultar el SCOP.
        </FormHelperText>
        <FormControlLabel
          control={<Switch checked={Boolean(values.isCompany)} onChange={(e) => formik.setFieldValue('isCompany', e.target.checked)} disabled={guardando} />}
          label='Vehículo de la empresa'
        />
        <FormControlLabel
          control={<Switch color='warning' checked={Boolean(values.fav)} onChange={(e) => formik.setFieldValue('fav', e.target.checked)} disabled={guardando} />}
          label='Favorito (sólo para ti)'
        />
      </Box>

      <Button
        type='submit'
        color='success'
        variant='contained'
        fullWidth
        sx={{ mt: 2 }}
        disabled={guardando}
        startIcon={guardando ? <CircularProgress size={18} color='inherit' /> : undefined}
      >
        {guardando ? 'Guardando…' : edit ? 'Guardar cambios' : 'Registrar vehículo'}
      </Button>
    </Box>
  );
}

export default ModalVehiculo

import { Autocomplete, Box, Button, CircularProgress, InputAdornment, TextField, Tooltip, TooltipProps, keyframes, styled, tooltipClasses } from '@mui/material';
import { useEffect, useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';
import { puntoUbicacion } from '../../types/puntoubicacion.interface';
import { PuntosSchema } from '../../utils/validateGuiaRemision';

import InfoIcon from '@mui/icons-material/Info';
import { Ubigeos } from '../../types/ubigeos.interface';
import { useAuxiliares } from '../../context/AuxiliarProvider';
import { searchPersona } from '../../types/persona.interface';
import { useNotification } from '../../context/notification.context';
import ButtonSearch from '../ButtonSearch';



const PuntoInicialValues: puntoUbicacion = {
  codLocal: '',
  direccion: '',
  fav: false,
  isCompany: false,
  ruc: '',
  ubigeo: '230101',
  nombreCorto: '',
  rznSocial: '',
  id: 0
}

interface PuntoUbicacionFormProps {
  initialValue?: puntoUbicacion;
  onConfirm: (puntos: any) => void;
  edit: Boolean,
}

const ModalPuntoUbicacion = ({ initialValue, onConfirm, edit }: PuntoUbicacionFormProps) => {

  const [fav, setFav] = useState<boolean>(initialValue?.fav || false);
  const [isCompany, setIsCompany] = useState<boolean>(initialValue?.isCompany || false);

  const { getError } = useNotification()

  const [inputValue, setInputValue] = useState('');
  const [_selectedUbigeo, setSelectedUbigeo] = useState<string | null>(null);

  const [ubigeos, setUbigeos] = useState<Ubigeos[]>(null);

  const [loading, setLoading] = useState<boolean>(false)

  const [value, setValue] = useState<Ubigeos | null>(null);


  const token = localStorage.getItem('AUTH_TOKEN');

  const storePuntos = async (values: puntoUbicacion) => {


    try {
      const { data, status } = await clienteAxios.post('/api/puntos', {
        ubigeo: values.ubigeo,
        direccion: values.direccion,
        fav: values.fav,
        isCompany: values.isCompany,
        rznSocial: values.rznSocial,
        ruc: values.ruc,
        nombreCorto: values.nombreCorto,
        codLocal: values.codLocal
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // console.log(data)
      if (status === 200) {
        onConfirm(data.punto);
      }
    }
    catch (error) {
      console.log(error)
    }



  }

  const updatePuntos = async (values: puntoUbicacion) => {
    try {
      const { data, status } = await clienteAxios.put(`/api/puntos/${values.id}`, {
        ubigeo: values.ubigeo,
        direccion: values.direccion,
        fav: values.fav,
        isCompany: values.isCompany,
        ruc: values.ruc,
        nombreCorto: values.nombreCorto,
        rznSocial: values.rznSocial,
        codLocal: values.codLocal
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)
      if (status === 200) {
        onConfirm(data.punto);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }

  const pulse = keyframes`
  0% {
    border: 4px solid rgba(236, 206, 31, 0.4);
    
    background-color:  rgba(236, 206, 31, 0.4);
  }
  50% {
    border: 4px solid rgba(236, 206, 31, .8);
    background-color: rgba(236, 206, 31, .8);
    
  }
  100% {
    border: 4px solid rgba(236, 206, 31, 0.4);
    background-color: rgba(236, 206, 31, 0.4);
    
  }
`;
  // Creamos un componente estilizado para el InputAdornment
  const AnimatedInputAdornment = styled(InputAdornment)(({ }) => ({
    animation: `${pulse} 2s infinite`,
    display: 'flex',
    alignItems: 'center',
    height: 'auto',
    borderRadius: '50%'
  }));

  const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: 'white',
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));


  const formik = useFormik({
    initialValues: initialValue || PuntoInicialValues,
    validationSchema: PuntosSchema,
    onSubmit: (values) => {


      const newValues:puntoUbicacion={
        ...values,
        direccion:values.direccion.toUpperCase(),
        nombreCorto:values?.nombreCorto?.toUpperCase()||'',
      }

      if (edit) {
        updatePuntos(newValues)
      } else {
        storePuntos(newValues)
      }

    },
  });

  const onChangeUbigeo = (_event: unknown, newValue: Ubigeos) => {
    if (newValue) {
      setValue(newValue)
      setSelectedUbigeo(newValue.ubigeo);
      formik.setFieldValue('ubigeo', newValue.ubigeo)
    } else {
      setSelectedUbigeo(null);
      formik.setFieldValue('ubigeo', '')
    }
  }

  const handleSearch = (searchPerson: searchPersona): void => {

    if (!searchPerson) {
      getError('Tiempo de espera terminado, intentelo otra vez o verifica el número')
      return;
    }
    if (searchPerson.status === 'error') {
      getError(searchPerson.message)
      return;
    }
    formik.setFieldValue('rznSocial', searchPerson.persona.nombreRazonSocial)
  }

  useEffect(() => {
    formik.setFieldValue('fav', fav)
  }, [fav])

  useEffect(() => {
    formik.setFieldValue('isCompany', isCompany)
  }, [isCompany])


  const { getUbigeos2 } = useAuxiliares()
  // console.log(ubigeos)


  const getUbigeos = async()=>{
    setLoading(true)
    const data = await getUbigeos2()
    setUbigeos(data)

    setLoading(false)

  }
  useEffect(()=>{
    getUbigeos()
  },[])


  useEffect(() => {
    if(ubigeos){
      if (ubigeos.length > 0) {
        // console.log(initialValue.ubigeo)
  
        const initialUbigeo = ubigeos.find(option => option.ubigeo === initialValue?.ubigeo) || null;
        // console.log(initialUbigeo)
        setValue(initialUbigeo);
        setSelectedUbigeo(initialUbigeo?.ubigeo || null);
      }
    }
  }, [ubigeos]);

  return (
    <>
      {loading ?
        <Box width={200} height={200} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <CircularProgress color="inherit" size={80} />
        </Box>
        :
        <Box component={'form'} onSubmit={formik.handleSubmit}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="codLocal"
            type="text"
            label="Código de Local"
            sx={{ my: 1.5 }}
            value={formik.values.codLocal}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.codLocal && formik.errors.codLocal}
            error={formik.touched.codLocal && Boolean(formik.errors.codLocal)}
            InputProps={{
              endAdornment: (
                <AnimatedInputAdornment position="end">
                  <LightTooltip arrow title="Usa Código de Local solo si vas a considerar un RUC para establecer el punto de Ubicación, si no, dejalo por defecto {0000}">
                    <InfoIcon color="action" />
                  </LightTooltip>
                </AnimatedInputAdornment>
              ),
            }}

          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="direccion"
            type="text"
            label="Dirección"
            sx={{ my: 1.5 }}

            value={formik.values?.direccion?.toUpperCase()}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.direccion && formik.errors.direccion}
            error={formik.touched.direccion && Boolean(formik.errors.direccion)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />

          <Box display={'flex'} flexDirection={{ md: 'row' }} alignItems={'center'} gap={1}>
            <TextField
              margin="normal"
              size="small"
              fullWidth
              name="ruc"
              type="text"
              label="R.U.C. (11 caracteres)"
              sx={{ my: 1.5 }}

              value={formik.values.ruc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={formik.touched.ruc && formik.errors.ruc}
              error={formik.touched.ruc && Boolean(formik.errors.ruc)}
              InputProps={{
                endAdornment: (
                  <AnimatedInputAdornment position="end">
                    <LightTooltip arrow title="No uses un R.U.C. si vas a consignar un DNI, dejalo en blanco. SUNAT hará la validación y va a notificar un ERROR">
                      <InfoIcon color="action" />
                    </LightTooltip>
                  </AnimatedInputAdornment>
                ),
              }}
            />
            <ButtonSearch type={'6'} valor={formik.values.ruc} onSearch={handleSearch} />
          </Box>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="rznSocial"
            type="text"
            label="Razón Social (Opcional)"
            sx={{ my: 1.5 }}

            value={formik.values.rznSocial}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.rznSocial && formik.errors.rznSocial}
            error={formik.touched.rznSocial && Boolean(formik.errors.rznSocial)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="nombreCorto"
            type="text"
            label="Nombre corto del punto de ubicación"
            sx={{ my: 1.5 }}

            value={formik.values?.nombreCorto?.toUpperCase()}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.nombreCorto && formik.errors.nombreCorto}
            error={formik.touched.nombreCorto && Boolean(formik.errors.nombreCorto)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
          <Autocomplete
            size='small'
            options={ubigeos}
            value={value}
            getOptionLabel={(option) => option.fullubigeo}
            filterOptions={(options, state) =>
              options.filter((option) =>
                option.distrito.toLowerCase().includes(state.inputValue.toLowerCase())
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecciona un Ubigeo"
                variant="outlined"
              // onChange={(event) => setInputValue(event.target.value)}
              />
            )}
            inputValue={inputValue}
            onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
            onChange={onChangeUbigeo}
          />

          <Box textAlign={'center'}>

            <Button onClick={() => setFav(!fav)} variant={!fav ? 'outlined' : 'contained'} color='warning' sx={{ display: 'inline-block', mt: 2, width: '80%', letterSpacing: 20, fontWeight: 600 }}>
              FAVORITO
            </Button>
          </Box>

          <Box textAlign={'center'}>
            <Button onClick={() => setIsCompany(!isCompany)} variant={!isCompany ? 'outlined' : 'contained'} color='info' sx={{ display: 'inline-block', my: 2, width: '80%', letterSpacing: 5, fontWeight: 600 }}>
              PUNTO DE LA EMPRESA?
            </Button>
          </Box>
          <Button type='submit' color='success' variant='outlined' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
            Guardar
          </Button>
        </Box>
      }
    </>
  );
}

export default ModalPuntoUbicacion
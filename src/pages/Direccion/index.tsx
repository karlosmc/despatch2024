import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Stack, Button, InputAdornment, Tooltip, styled, TooltipProps, tooltipClasses, keyframes, Box, CircularProgress } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

import { Direccion } from "../../types/guias/guiaremision.interface";
import { PartidaSchema } from "../../utils/validateGuiaRemision";
import InfoIcon from '@mui/icons-material/Info';
import { Ubigeos } from "../../types/ubigeos.interface";
import { DialogComponentCustom } from "../../components";
import ModalPuntoUbicacion from "../../components/Puntos";
import { puntoUbicacion } from "../../types/puntoubicacion.interface";
import SearchPuntos from "../../components/Puntos/SearchPuntos";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { ChipInterface } from "../../types/general.interface";
import { useAuxiliares } from "../../context/AuxiliarProvider";
import ButtonSearch from "../../components/ButtonSearch";
import { searchPersona } from "../../types/persona.interface";
import { useNotification } from "../../context/notification.context";


interface DireccionFormProps {
  initialValue: Direccion;
  onChange: (direccion: Direccion) => void;
  schema?: Yup.AnyObjectSchema;
  codTraslado: string;
}

const DireccionValues: Direccion = {
  codLocal: "",
  direccion: "",
  ruc: "",
  ubigeo: "",
  rznSocial: "",
};


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

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const StyledNewButton = styled(Button)(({ }) => ({
  backgroundColor: '#375A7F',
  color: 'white',
  '&:hover': {
    backgroundColor: '#2F4D6C',
  }
}))

const StyledSearchButton = styled(Button)(({ }) => ({
  backgroundColor: '#00BC8C',
  color: 'white',
  '&:hover': {
    backgroundColor: '#00A077',
  }
}))

const DatosDireccion = ({
  initialValue,
  onChange,
  schema,
  codTraslado
}: DireccionFormProps) => {
  // if (codTraslado !== '04') {
  //   initialValue.codLocal = '0000'
  // }
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || PartidaSchema,
    onSubmit: (values) => {

      const newValues:Direccion={
        ...values,
        direccion:values.direccion.toUpperCase(),
        rznSocial:values.rznSocial.toUpperCase(),        
      }

      onChange(newValues);
    },
  });

  const [inputValue, setInputValue] = useState('');
  const [_selectedUbigeo, setSelectedUbigeo] = useState<string | null>(null);

  const [value, setValue] = useState<Ubigeos | null>(null);

  const { getError } = useNotification()

  // const token = localStorage.getItem('AUTH_TOKEN');

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [dataFilter, setDataFilter] = useState<puntoUbicacion[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [loading, setLoading] = useState(false)
  const [ubigeos, setUbigeos] = useState<Ubigeos[]>(null)

  const token = localStorage.getItem('AUTH_TOKEN');

  const filterFav = async (tipo: string) => {
    try {

      const { data, status } = await clienteAxios(`/api/puntos/buscar?${tipo}=1`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 200) {
        setIsLoading(false)
        setDataFilter(data?.data)
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  // const correlativo = parseInt(dataUser.sercor.correlativo)+1


  const { getUbigeos2 } = useAuxiliares();

  useEffect(() => {
    if (codTraslado === '04') {
      filterFav('isCompany')
    }
    else {
      filterFav('fav')
    }

  }, [codTraslado])


  const getUbigeos = async()=>{
    setLoading(true)
    const data = await getUbigeos2()
    setUbigeos(data)

    setLoading(false)

  }
  useEffect(()=>{
    getUbigeos()
  },[])

  /* establecer valores dando click a los valores por defecto */

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const handleClean = () => {
    // setDataDireccion(DireccionValues);
    onChange(DireccionValues);
  };


  const handleConfirm = (punto: puntoUbicacion): void => {
    formik.setFieldValue('id', punto.id)
    formik.setFieldValue('ubigeo', punto.ubigeo)
    formik.setFieldValue('direccion', punto.direccion)
    formik.setFieldValue('codLocal', punto.codLocal)
    formik.setFieldValue('ruc', punto.ruc ? punto.ruc : '')
    handleCloseModalForm()
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

  const handleSetFavorite = (item: ChipInterface): void => {
    const punto = dataFilter.find(it => it.id === item.id);
    formik.setFieldValue('id', punto.id)
    formik.setFieldValue('rznSocial', punto.rznSocial ? punto.rznSocial : '')
    formik.setFieldValue('ubigeo', punto.ubigeo)
    formik.setFieldValue('direccion', punto.direccion)
    formik.setFieldValue('codLocal', punto.codLocal)
    formik.setFieldValue('ruc', punto.ruc ? punto.ruc : '')
  }

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

  useEffect(() => {

    if(ubigeos){
      if (ubigeos.length > 0) {
        const initialUbigeo = ubigeos.find(option => option.ubigeo === formik.values?.ubigeo) || null;
        // console.log(initialUbigeo)
        setValue(initialUbigeo);
        setSelectedUbigeo(initialUbigeo?.ubigeo || null);
      }
    }
  }, [formik.values.ubigeo, ubigeos]);

  return (
    <>

      {loading ?
        <Box width={200} height={200} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <CircularProgress color="inherit" size={80} />
        </Box>
        :
        <>
          <ChipFavoritos isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Puntos de ubicación favoritos" />
          <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
            <StyledNewButton fullWidth variant="contained"
              onClick={() => {
                handleOpenModalForm(
                  <ModalPuntoUbicacion initialValue={null} edit={false} onConfirm={handleConfirm} />,
                  'Punto Ubicacion'
                )
              }}
            >
              Crear Punto
            </StyledNewButton>

            <StyledSearchButton fullWidth variant="contained"
              onClick={() => {
                handleOpenModalForm(
                  <SearchPuntos onCheck={handleConfirm} />,
                  'Buscar Punto de ubicación'
                )
              }}
            >
              Buscar
            </StyledSearchButton>
          </Box>
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
                readOnly: formik.values.id <= 1 ? false : true
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
              InputProps={{ readOnly: formik.values.id <= 1 ? false : true }}
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
                  readOnly: formik.values.id <= 1 ? false : true
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

              value={formik.values?.rznSocial?.toUpperCase()}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={formik.touched.rznSocial && formik.errors.rznSocial}
              error={formik.touched.rznSocial && Boolean(formik.errors.rznSocial)}
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
              isOptionEqualToValue={(option, value) =>
                option.id === value.id
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
              readOnly={formik.values.id <= 1 ? false : true}
            />

            <Stack direction="row" spacing={2} mt={1}>
              <Button fullWidth variant="contained" color="success" type="submit">
                Agregar
              </Button>

              <Button fullWidth variant="outlined" color="secondary" onClick={handleClean}>
                Limpiar
              </Button>
            </Stack>
          </Box>
          <DialogComponentCustom
            closeButton={
              <Button
                variant="contained"
                color="error"
                onClick={() => handleCloseModalForm()}
              >
                Cerrar
              </Button>
            }
            open={modalsForm.open}
            title={modalsForm.title}
            element={modalsForm.form}
          />
        </>
      }

    </>
  );
};


export default DatosDireccion;

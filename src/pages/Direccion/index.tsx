import React, { useState, useEffect, MouseEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Stack, Button, Chip, Paper, InputAdornment, Tooltip, styled, TooltipProps, tooltipClasses, keyframes, Box } from "@mui/material";

import { useFormik } from "formik";

import * as Yup from "yup";
import { DirectionsUser, UserLogin } from "../../types/login.interface";
import { Direccion } from "../../types/guias/guiaremision.interface";
import { PartidaSchema } from "../../utils/validateGuiaRemision";
import InfoIcon from '@mui/icons-material/Info';
import { Ubigeos } from "../../types/ubigeos.interface";
import { DialogComponentCustom } from "../../components";
import ModalPuntoUbicacion from "../../components/Puntos";
import { puntoUbicacion } from "../../types/puntoubicacion.interface";
import SearchPuntos from "../../components/Puntos/SearchPuntos";


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
};

const DireccionUserValues: DirectionsUser = {
  alias: "",
  company: "",
  direction: "",
  id: "",
  isconcurrent: "",
  tipo: "",
  codLocal: "",
  direccion: "",
  ruc: "",
  ubigeo: "",
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


const DatosDireccion = ({
  initialValue,
  onChange,
  schema,
  codTraslado
}: DireccionFormProps) => {
  if (codTraslado !== '04') {
    initialValue.codLocal = '0000'
  }
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || PartidaSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

  const [directionChip, setDirectionChip] = useState<DirectionsUser>(DireccionUserValues)

  const [ubigeoInicial, setUbigeoInicial] = useState<string>(initialValue.ubigeo || '')

  const [inputValue, setInputValue] = useState('');
  const [selectedUbigeo, setSelectedUbigeo] = useState<string | null>(null);

  const [value, setValue] = useState<Ubigeos | null>(null);

  const token = localStorage.getItem('AUTH_TOKEN');

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });



  // const dataUser: UserLogin = JSON.parse(localStorage.getItem('userlogin'));
  // console.log(dataUser);

  // if(schema=== undefined){

  // }
  // const listDirections: DirectionsUser[] = dataUser.directions.filter(item => schema === undefined ? item.tipo === 'P' : item.tipo === 'L');
  const listDirections: DirectionsUser[] = [];
  // const correlativo = parseInt(dataUser.sercor.correlativo)+1


  const [ubigeos, setUbigeos] = useState<Ubigeos[]>([]);




  useEffect(() => {
    const loadData = async () => {
      const loadUbigeo = await fetch("src/files/ubigeos.json");
      const loadUbigeoJson = await loadUbigeo.json();
      setUbigeos(loadUbigeoJson);
    };

    loadData();
  }, []);

  /* establecer valores dando click a los valores por defecto */
  useEffect(() => {
    if (directionChip.alias !== '') {

      formik.setFieldValue('codlocal', directionChip.codLocal)
      formik.setFieldValue('direccion', directionChip.direccion)
      formik.setFieldValue('ruc', directionChip.ruc)
      formik.setFieldValue('ubigeo', directionChip.ubigeo)
      // initialValue.ubigeo=directionChip.ubigeo
      setUbigeoInicial(directionChip.ubigeo)
    }
  }, [directionChip])


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


  const handleConfirm=(punto:puntoUbicacion):void=>{

    formik.setFieldValue('ubigeo', punto.ubigeo)
    formik.setFieldValue('direccion', punto.direccion)
    formik.setFieldValue('codLocal', punto.codLocal)
    formik.setFieldValue('ruc', punto.ruc?punto.ruc:'')
    handleCloseModalForm()
  }

  const handleClickDirection = (evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const spanChip = evt.currentTarget.id;
    setDirectionChip(listDirections.find(item => item.id === spanChip));
  };

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

  // const handleCheckProduct = (punto:puntoUbicacion):void => {

  //   formik.setFieldValue('ubi', producto.ubi)
  //   formik.setFieldValue('codProdSunat', producto.codProdSunat)
  //   formik.setFieldValue('descripcion', producto.descripcion)
  //   formik.setFieldValue('unidad', producto.unidad)
  //   handleCloseModalForm()
  // }


  useEffect(() => {

    if (ubigeos.length > 0) {
      const initialUbigeo = ubigeos.find(option => option.ubigeo === formik.values?.ubigeo) || null;
      // console.log(initialUbigeo)
      setValue(initialUbigeo);
      setSelectedUbigeo(initialUbigeo?.ubigeo || null);
    }
  }, [formik.values.ubigeo,ubigeos]);




  return (
    <>
      <Paper
        elevation={15}
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          my: 2,
          py: 2,
          borderRadius: 10,
          width: "100%",
        }}
      >
        {listDirections.map((direc) => {
          return (
            <Chip
              sx={{
                height: "auto",
                margin: 1,
                py: 1,
                width: 180,
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  textAlign: "center",
                  fontWeight: "bold",
                },
                color: "white",
              }}
              id={direc.id}
              label={direc.alias}
              key={direc.id}
              // color={indicador.selected ? "success" : "default"}
              clickable={true}
              onClick={handleClickDirection}
            // icon={indicador.icon}
            />
          );
        })}
      </Paper>
      <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
        <Button fullWidth variant="contained" color="success"
          onClick={() => {
            handleOpenModalForm(
              <ModalPuntoUbicacion initialValue={null} edit={false} onConfirm={handleConfirm} />,
              'Punto Ubicacion'
            )
          }}
        >
          Crear
        </Button>

        <Button fullWidth variant="contained" color="warning"
         onClick={() => {
          handleOpenModalForm(
            <SearchPuntos onCheck={handleConfirm}/>,
            'Buscar Punto de ubicación'
          )
        }}
        >
          Buscar
        </Button>
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

          value={formik.values.direccion}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.direccion && formik.errors.direccion}
          error={formik.touched.direccion && Boolean(formik.errors.direccion)}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="ruc"
          type="text"
          label="R.U.C. (solo valido para RUC de 11 caracteres)"
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



        <Stack direction="row" spacing={2} mt={1}>
          <Button variant="outlined" color="success" type="submit">
            Agregar
          </Button>

          <Button variant="outlined" color="error" onClick={handleClean}>
            Clean
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
  );
};


export default DatosDireccion;

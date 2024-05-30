import React, { useEffect, useState } from 'react'
import { AddDoc, Client, DatosGenerales, Detail, Direccion, Envio, EnvioChoferes, EnvioTransportista, EnvioVehiculo, GuiaRemision } from '../../types/guias/guiaremision.interface';
import dayjs from 'dayjs';
import { useNotification } from '../../context/notification.context';
import { isObject, useFormik } from 'formik';
import { CompradorSchema, GuiaRemisionSchema, LlegadaSchema } from '../../utils/validateGuiaRemision';
import { Box, Button, Container, Grid, IconButton, Paper, SxProps, Theme, Typography, useTheme } from '@mui/material';

import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import PinDropIcon from "@mui/icons-material/PinDrop";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CommuteIcon from "@mui/icons-material/Commute";



import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DialogComponentCustom } from '../../components';
import DatosGeneralesForm from '../DatosGeneralesForm';
import Cliente from '../PersonaCliente';
import EnvioForm from '../DatosEnvioForm';
import DocumentosAdicionales from '../DocumentosAdicionales';
import DocumentoAdicional from '../DocumentosAdicionales/form';
import DocumentosDetalles from '../DocumentosDetalles';
import DocumentoDetalle from '../DocumentosDetalles/form';
import { red, yellow } from '@mui/material/colors';
import DatosDireccion from '../Direccion';
import Conductores from '../Conductores';
import DatosTransportista from '../DatosTransportista';
import { error } from 'console';






// const ChoferesValues: EnvioChoferes = {
//   tipo: "",
//   tipoDoc: "",
//   apellidos: "",
//   licencia: "",
//   nombres: "",
//   nroDoc: "",
// };

const VehiculoValues: EnvioVehiculo = {
  placa: '',
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

const EnvioValues: Envio = {
  codTraslado: "02",
  desTraslado: "COMPRA",
  fecTraslado: dayjs().format("YYYY-MM-DDTHH:mm"),
  indicadores: [],
  indTransbordo: "",
  modTraslado: "02",
  numBultos: 0,
  pesoTotal: 2000,
  undPesoTotal: "KGM",
  // pesoItems:0,
  // sustentoPeso:''
};

const DatosGeneralesValues: DatosGenerales = {
  correlativo: '',
  fechaEmision: dayjs().format("YYYY-MM-DDTHH:mm"),
  serie: '',
  tipoDoc: '09',
  version: '2.0'
}

type ErroresType ={
  componente:string,
  error:boolean
}

const initialValues: GuiaRemision = {
  datosGenerales: DatosGeneralesValues,
  destinatario: {
    numDoc: '',
    rznSocial: '',
    tipoDoc: '6'
  },
  comprador: {
    numDoc: '',
    rznSocial: '',
    tipoDoc: '6'
  },
  envio: EnvioValues,
  addDocs: [
    {
      emisor: "20318171701",
      nro: "F001-21",
      tipo: "01",
      tipoDesc: "FACTURA",
    },
  ],
  details: [{
    codigo: 'PRO0001',
    codProdSunat: '15101505',
    descripcion: 'PRODUCTO 1',
    cantidad: 10,
    unidad: 'NIU',
  }],
  choferes: [],
  vehiculo: VehiculoValues,
  observacion: '',
  partida: {
    codlocal: '',
    direccion: '',
    ruc: '',
    ubigeo: ''
  },
  llegada: {
    codlocal: '',
    direccion: '',
    ruc: '',
    ubigeo: ''
  },
  transportista: { id: '', nroMtc: '', numDoc: '', rznSocial: '', tipoDoc: '6' }
};



type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const GuiaRemisionMain = () => {

  const { getError, getSuccess } = useNotification();


  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>([]);

  const [detalles, setDetalles] = useState<Detail[]>([]);

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: false,
    onSubmit: (values) => {
      // console.log(values);
      const doc = values;

      console.log(doc);
    }
  })

  useEffect(() => {
    if (!formik.isSubmitting) return;
    if (Object.keys(formik.errors).length > 0) {
      const ErrorValues = Object.values(formik.errors)[0];
      // console.log(ErrorValues);
      //const ErrorKeys = Object.keys(formik.errors)[0]
      if (isObject(ErrorValues)) {
        // console.log(Object.values(ErrorValues)[0])
        const ErrorValuesSub = Object.values(ErrorValues)[0];
        // const ErrorKeySub = Object.keys(ErrorKeys)[0]
        if (isObject(ErrorValuesSub)) {
          //getError(`Error en la Seccion:${Object.keys(ErrorKeySub)[0]}: ${Object.values(ErrorValuesSub)[0]}`)
          getError(`${Object.values(ErrorValuesSub)[0]}`);
        } else {
          //getError(`Error en la Seccion:${ErrorKeys.toUpperCase()}: ${ErrorValuesSub}`)
          getError(ErrorValuesSub);
        }
      } else {
        
        
        getError(ErrorValues);
      }
    }
    
  }, [formik]);


  /* ESTILOS */

  const theme = useTheme();

  const paperClient: SxProps<Theme> = {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    borderRadius: 7,
    py: 5,
    mx: 10,
    my: 2,
    [theme.breakpoints.down("sm")]: {
      mx: 0,
    },

  }

  const paperDirection: SxProps<Theme> = {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    borderRadius: 7,
    py: 5,
    mx: 10,

    [theme.breakpoints.down("sm")]: {
      mx: 0,
    },
  };

  const BoxShadoWButton = {
    boxShadow: "0 0 40px #949494",
    "&:hover": {
      animation: "animatedButton 1.5s ease-in-out",
    },
    "@keyframes animatedButton": {
      "0%": {
        transform: "scale(1)",
      },
      "50%": {
        transform: "scale(1.2)",
      },
      "100%": {
        transform: "scale(1)",
      },
    },
  };


  /* estilos */

  const onHandleDatosGeneralesChange = (datosGenerales: DatosGenerales) => {
    formik.setFieldValue("datosGenerales", datosGenerales);
  }

  const handleDestinatarioChange = (cliente: Client): void => {

    formik.setFieldValue("destinatario", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleCompradorChange = (cliente: Client) => {

    formik.setFieldValue("comprador", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleEnvioChange = (envio: Envio) => {
    formik.setFieldValue("envio", envio);
  };

  const handleNewAddDoc = (newAddDoc: AddDoc): void => {

    setAdicionalDocs((addDoc) => [...addDoc, newAddDoc]);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleNewDetail = (newDetail: Detail): void => {
    // console.log(newDetail)
    setDetalles((detalles) => [...detalles, newDetail]);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handlePartidaChange = (direccion: Direccion): void => {

    formik.setFieldValue('partida', direccion);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleLlegadaChange = (direccion: Direccion): void => {
    console.log('entro')
    formik.setFieldValue('llegada', direccion);
    setModalsForms({ ...modalsForm, open: false });
  };

  useEffect(() => {
    // if (formik.values.addDocs.length === 0) {
    formik.setFieldValue("addDocs", adicionalDocs);
    // }
  }, [adicionalDocs]);

  useEffect(() => {
    // if (formik.values.addDocs.length === 0) {
    formik.setFieldValue("details", detalles);
    // }
  }, [detalles]);

  const handleConfirmListaChoferes = (choferes: EnvioChoferes[]): void => {
    // console.log(choferes)
    formik.setFieldValue('choferes', choferes);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleTransportistaChange = (transportista: EnvioTransportista): void => {

    formik.setFieldValue('transportista', transportista);
    setModalsForms({ ...modalsForm, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
          >
            {/* Datos generales */}
            <Grid spacing={2} container item xs={12}>
              <DatosGeneralesForm onChange={onHandleDatosGeneralesChange} datosGeneralesValues={formik.values.datosGenerales} />
            </Grid>
            {/* Datos generales */}

            {/* Destinatario y comprador */}
            <Grid
              mb={1}
              container
              item
              xs={12}
              textAlign="center"
              spacing={2}
            >
              <Grid item xs={6}>
                <Paper elevation={5} sx={paperClient}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={(_e) =>
                      handleOpenModalForm(
                        <Cliente
                          // initialValue={formData.destinatario}
                          initialValue={formik.values.destinatario}
                          onChange={handleDestinatarioChange}
                        />,
                        "Destinatario"
                      )
                    }
                    sx={{ height: 80, width: 100 }}
                  >
                    Destinatario
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={5} sx={paperClient}>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={(_e) =>
                      handleOpenModalForm(
                        <Cliente
                          // initialValue={formData.comprador}
                          initialValue={formik.values.comprador}
                          onChange={handleCompradorChange}
                          schema={CompradorSchema}
                        />,
                        "Comprador"
                      )
                    }
                    sx={{ height: 80, width: 100 }}
                  >
                    Comprador
                  </Button>
                </Paper>
              </Grid>
            </Grid>
            {/* Destinatario y comprador */}
            {/* Envio */}
            <Grid item container xs={12}>
              <EnvioForm
                onChange={handleEnvioChange}
                EnvioValues={EnvioValues}
              />
            </Grid>
            {/* Envio */}
            {/* Documentos Adicionales */}
            <Grid item container xs={12} textAlign={'center'} justifyContent={'center'}>
              <Button
                variant="contained"
                color="secondary"
                onClick={(_e) =>
                  handleOpenModalForm(
                    <DocumentoAdicional onNewAddDoc={handleNewAddDoc} />,
                    "Documentos adicionales"
                  )
                }
                sx={{ color: "whitesmoke", fontWeight: "bold", mb: 1 }}
              >
                Agregar documentos adicionales
              </Button>

            </Grid>
            <Grid item xs={12}>
              <DocumentosAdicionales adicionales={formik.values.addDocs} />
            </Grid>
            {/* Documentos Adicionales */}


            {/* Detalles */}
            <Grid item container xs={12} textAlign={'center'} justifyContent={'center'} mt={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={(_e) =>
                  handleOpenModalForm(
                    <DocumentoDetalle onNewDetail={handleNewDetail} />,
                    "Detalles"
                  )
                }
                sx={{ color: "whitesmoke", fontWeight: "bold", mb: 1 }}
              >
                Agregar Detalles
              </Button>
            </Grid>

            <Grid item xs={12}>
              <DocumentosDetalles detalles={formik.values.details} />
            </Grid>

            {/* Detalles */}

            {/* Punto LLegada / Partida */}

            <Grid item container xs={12} textAlign={'center'} justifyContent={'center'} mt={3}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={5} sx={paperDirection}>
                  <Box component={Button}
                    display={'flex'}
                    flexDirection={'column'}
                    variant='contained'
                    bgcolor={yellow[800]}
                    color='white'
                    sx={{
                      height: 80,
                      width: 100,
                      borderColor: theme.palette.info.main,
                      '&:hover': {
                        bgcolor: '#f8c314'
                      }

                    }}
                    onClick={(_e) =>
                      handleOpenModalForm(
                        <DatosDireccion
                          initialValue={formik.values.partida}
                          onChange={handlePartidaChange}
                        />,
                        "Punto de partida"
                      )
                    }
                  >
                    <PersonPinCircleIcon fontSize='large' />
                    <Typography>Partida</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={5} sx={paperDirection}>

                  <Box component={Button}
                    display={'flex'}
                    flexDirection={'column'}
                    variant='contained'
                    bgcolor={red[800]}
                    color='white'
                    sx={{
                      height: 80,
                      width: 100,
                      borderColor: theme.palette.info.main,
                      '&:hover': {
                        bgcolor: '#f51717'
                      }

                    }}
                    onClick={(_e) =>
                      handleOpenModalForm(
                        <DatosDireccion
                          initialValue={formik.values.llegada}
                          onChange={handleLlegadaChange}
                          schema={LlegadaSchema}
                        />,
                        "Punto de llegada"
                      )
                    }
                  >
                    <PinDropIcon fontSize='large' />
                    <Typography>Llegada</Typography>
                  </Box>

                </Paper>
              </Grid>
            </Grid>

            {/* Punto LLegada / Partida */}
            {/* Conductores */}
            <Grid item container xs={12} textAlign={'center'} justifyContent={'center'} mt={3}>
              <Grid item xs={12}>

                <Box component={'div'} display={'grid'} gridTemplateColumns={{xs: "repeat(1fr)", sm: "repeat(3,1fr)" }} columnGap={1}>
                  <Box component={'div'}>
                    <Typography color="secondary">Chofer</Typography>
                    <IconButton
                      color="secondary"
                      size='large'
                      aria-label="add an alarm"
                      sx={BoxShadoWButton}
                      onClick={(_e) =>
                        handleOpenModalForm(
                          <Conductores
                            choferes={formik.values.choferes}
                            onConfirm={handleConfirmListaChoferes}
                          />,
                          "Choferes"
                        )
                      }
                    >
                      <AssignmentIndIcon fontSize="large" />
                    </IconButton>
                  </Box>
                  <Box component={'div'}>
                    <Typography color="primary">Transportista</Typography>
                    <Box position={'relative'}>
                      <IconButton
                        
                        color="primary"
                        aria-label="add an alarm"
                        sx={{...BoxShadoWButton}}
                        size='large'
                        // disabled
                        onClick={(_e) =>
                          handleOpenModalForm(
                            <DatosTransportista
                              initialValue={formik.values.transportista}
                              onChange={handleTransportistaChange}
                            />,
                            "Transportista"
                          )
                        }
                      >
                        <CommuteIcon fontSize="large" />
                        
                      </IconButton>
                      
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {/* Conductores */}

          </Grid>
          <Button
                sx={{ mt: 2, color: "white", fontWeight: "bold" }}
                fullWidth
                type="submit"
                variant="contained"
                color="warning"
              >
                Submit
              </Button>

        </form>
        <DialogComponentCustom
          closeButton={
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleCloseModalForm()}
            >
              Close
            </Button>
          }
          open={modalsForm.open}
          title={modalsForm.title}
          element={modalsForm.form}
        />
      </Container>
    </LocalizationProvider>
  )


}

export default GuiaRemisionMain




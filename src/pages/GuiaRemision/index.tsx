import React, { useEffect, useState } from "react";
import {
  AddDoc,
  Client,
  DatosGenerales,
  Detail,
  Direccion,
  Envio,
  EnvioChoferes,
  EnvioTransportista,
  EnvioVehiculo,
  GuiaRemision,
} from "../../types/guias/guiaremision.interface";
import dayjs from "dayjs";
import { useNotification } from "../../context/notification.context";
import { isObject, useFormik } from "formik";
import {
  CompradorSchema,
  GuiaRemisionSchema,
  LlegadaSchema,
} from "../../utils/validateGuiaRemision";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  SxProps,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";

import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import PinDropIcon from "@mui/icons-material/PinDrop";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CommuteIcon from "@mui/icons-material/Commute";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';

import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DialogComponentCustom } from "../../components";
import DatosGeneralesForm from "../DatosGeneralesForm";
import Cliente from "../PersonaCliente";
import EnvioForm from "../DatosEnvioForm";
import DocumentosAdicionales from "../DocumentosAdicionales";
import DocumentoAdicional from "../DocumentosAdicionales/form";
import DocumentosDetalles from "../DocumentosDetalles";
import DocumentoDetalle from "../DocumentosDetalles/form";
import { red, yellow } from "@mui/material/colors";
import DatosDireccion from "../Direccion";
import Conductores from "../Conductores";
import DatosTransportista from "../DatosTransportista";

import DatosVehiculo from "../DatosVehiculos";
import VehiculosSecundarios from "../DatosVehiculos/secundarios";


// const ChoferesValues: EnvioChoferes = {
//   tipo: "",
//   tipoDoc: "",
//   apellidos: "",
//   licencia: "",
//   nombres: "",
//   nroDoc: "",
// };

const VehiculoValues: EnvioVehiculo = {
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: [],
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
  correlativo: "",
  fechaEmision: dayjs().format("YYYY-MM-DDTHH:mm"),
  serie: "",
  tipoDoc: "09",
  version: "2.0",
};

const initialValues: GuiaRemision = {
  datosGenerales: DatosGeneralesValues,
  destinatario: {
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  comprador: {
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
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
  details: [
    {
      codigo: "PRO0001",
      codProdSunat: "15101505",
      descripcion: "PRODUCTO 1",
      cantidad: 10,
      unidad: "NIU",
    },
  ],
  choferes: [],
  vehiculo: VehiculoValues,
  observacion: "",
  partida: {
    codlocal: "",
    direccion: "",
    ruc: "",
    ubigeo: "",
  },
  llegada: {
    codlocal: "",
    direccion: "",
    ruc: "",
    ubigeo: "",
  },
  transportista: {
    id: "",
    nroMtc: "",
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
};

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const GuiaRemisionMain = () => {
  const { getError } = useNotification();

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
    },
  });

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
  };

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

  const BoxShadoWButton: SxProps<Theme> = {
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
  };

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
    formik.setFieldValue("partida", direccion);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleLlegadaChange = (direccion: Direccion): void => {
    console.log("entro");
    formik.setFieldValue("llegada", direccion);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleConfirmListVehiculo = (vehiculos: EnvioVehiculo[]): void => {
    // console.log(vehiculos)

    formik.setFieldValue("vehiculo.secundarios", vehiculos);
    setModalsForms({ ...modalsForm, open: false });

    // setDataEnvio((prevData) => ({
    //   ...prevData,
    //   vehiculo: {
    //     ...prevData.vehiculo,
    //     secundarios: vehiculos,
    //   },
    // }));

    // setModalsForms({ ...modalsForm, open: false });
    //setOpenModalListaVehiculo(false);
  };

  const handleVehiculoChange = (vehiculo: EnvioVehiculo): void => {
    formik.setFieldValue("vehiculo", vehiculo);
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
    formik.setFieldValue("choferes", choferes);
    setModalsForms({ ...modalsForm, open: false });
  };

  const [expanded, setExpanded] = React.useState<string | false>('panel1');

  const handleChange =
    (panel: string) => (_, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);

    };

  const handleTransportistaChange = (
    transportista: EnvioTransportista
  ): void => {
    formik.setFieldValue("transportista", transportista);
    setModalsForms({ ...modalsForm, open: false });
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography textAlign={'center'} variant="h4" my={3}>GUIA DE REMISIÓN ELECTRÓNICA</Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
          >
            {/* Datos generales */}
            <Accordion
              expanded={expanded === "panel1"}
              onChange={handleChange("panel1")}
              sx={{ width: "100%" ,color:(expanded === "panel1"?theme.palette.success.main:theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Datos Generales
                </Typography>
                <FolderSharedIcon />
              </AccordionSummary>
              <AccordionDetails>

                <Grid spacing={2} container item xs={12}>
                  <DatosGeneralesForm
                    onChange={onHandleDatosGeneralesChange}
                    datosGeneralesValues={formik.values.datosGenerales}
                  />
                </Grid>

              </AccordionDetails>
            </Accordion>
            {/* Datos generales */}

            {/* Destinatario y comprador */}

            <Accordion
              expanded={expanded === "panel2"}
              onChange={handleChange("panel2")}
              sx={{ width: "100%" ,color:(expanded === "panel2"?theme.palette.success.main:theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Datos de destinatario y comprador
                </Typography>
                <PeopleIcon />
              </AccordionSummary>
              <AccordionDetails>

                <Grid mb={1} container item xs={12} textAlign="center" spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={5} sx={paperClient}>
                      <Button
                        variant="outlined"
                        color="info"
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
              </AccordionDetails>
            </Accordion>


            {/* Destinatario y comprador */}

            {/* Envio */}
            <Accordion
              expanded={expanded === "panel3"}
              onChange={handleChange("panel3")}
              sx={{ width: "100%" ,color:(expanded === "panel3"?theme.palette.success.main:theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel3bh-content"
                id="panel3bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Datos de Envío
                </Typography>
                <LocalShippingIcon />
              </AccordionSummary>
              <AccordionDetails>

                <Grid item container xs={12}>
                  <EnvioForm
                    onChange={handleEnvioChange}
                    EnvioValues={EnvioValues}
                  />
                </Grid>
              </AccordionDetails>
            </Accordion>
            {/* Envio */}

            {/* Documentos Adicionales */}

            <Accordion
              expanded={expanded === "panel4"}
              onChange={handleChange("panel4")}
              sx={{ width: "100%" ,color:(expanded === "panel4"?theme.palette.success.main:theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel4bh-content"
                id="panel4bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Documentos adicionales
                </Typography>
                <NoteAddIcon />
              </AccordionSummary>
              <AccordionDetails>


                <Grid
                  item
                  container
                  xs={12}
                  textAlign={"center"}
                  justifyContent={"center"}
                >
                  <Button
                    variant="contained"
                    color="primary"
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


              </AccordionDetails>
            </Accordion>

            {/* Documentos Adicionales */}

            {/* Detalles */}

            <Accordion
              expanded={expanded === "panel5"}
              onChange={handleChange("panel5")}
              sx={{ width: "100%" ,color:(expanded === "panel5"?theme.palette.success.main:theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel5bh-content"
                id="panel5bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Bienes transportados
                </Typography>
                <ShoppingBasketIcon />
              </AccordionSummary>
              <AccordionDetails>


                <Grid
                  item
                  container
                  xs={12}
                  textAlign={"center"}
                  justifyContent={"center"}
                  mt={2}
                >
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
              </AccordionDetails>
            </Accordion>

            {/* Detalles */}

            {/* Punto LLegada / Partida */}

            <Accordion
              expanded={expanded === "panel6"}
              onChange={handleChange("panel6")}
              sx={{ width: "100%" ,color:(expanded === "panel6"?theme.palette.success.main:theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel6bh-content"
                id="panel6bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Punto de Partida y LLegada
                </Typography>
                <LocationOnIcon/>

              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  item
                  container
                  xs={12}
                  textAlign={"center"}
                  justifyContent={"center"}
                  mt={3}
                >
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={5} sx={paperDirection}>
                      <Box
                        component={Button}
                        display={"flex"}
                        flexDirection={"column"}
                        variant="contained"
                        bgcolor={yellow[800]}
                        color="white"
                        sx={{
                          height: 80,
                          width: 100,
                          borderColor: theme.palette.info.main,
                          "&:hover": {
                            bgcolor: "#f8c314",
                          },
                        }}
                        onClick={(_e) =>
                          handleOpenModalForm(
                            <DatosDireccion
                              initialValue={formik.values.partida}
                              onChange={handlePartidaChange}
                              codTraslado={formik.values.envio.codTraslado}
                            />,
                            "Punto de partida"
                          )
                        }
                      >
                        <PersonPinCircleIcon fontSize="large" />
                        <Typography>Partida</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={5} sx={paperDirection}>
                      <Box
                        component={Button}
                        display={"flex"}
                        flexDirection={"column"}
                        variant="contained"
                        bgcolor={red[800]}
                        color="white"
                        sx={{
                          height: 80,
                          width: 100,
                          borderColor: theme.palette.info.main,
                          "&:hover": {
                            bgcolor: "#f51717",
                          },
                        }}
                        onClick={(_e) =>
                          handleOpenModalForm(
                            <DatosDireccion
                              initialValue={formik.values.llegada}
                              onChange={handleLlegadaChange}
                              schema={LlegadaSchema}
                              codTraslado={formik.values.envio.codTraslado}
                            />,
                            "Punto de llegada"
                          )
                        }
                      >
                        <PinDropIcon fontSize="large" />
                        <Typography>Llegada</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

              </AccordionDetails>
            </Accordion>

            {/* Punto LLegada / Partida */}

            {/* Conductores  transportistas y vehiculos*/}
            <Accordion
              expanded={expanded === "panel7"}
              onChange={handleChange("panel7")}
              sx={{ width: "100%" ,color:(expanded === "panel7"?theme.palette.success.main:theme.palette.success.dark)}}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large"/>}
                aria-controls="panel7bh-content"
                id="panel7bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Chofer / Transportista / Vehiculo
                </Typography>
                <BadgeIcon/>
              </AccordionSummary>
              <AccordionDetails>

                <Grid
                  item
                  container
                  xs={12}
                  textAlign={"center"}
                  justifyContent={"center"}
                  mt={3}
                >
                  <Grid item xs={12}>
                    <Box
                      component={"div"}
                      display={"grid"}
                      gridTemplateColumns={{
                        xs: "repeat(1fr)",
                        sm: "repeat(3,1fr)",
                      }}
                      columnGap={1}
                      alignItems={"end"}
                    >
                      <Box component={"div"}>
                        <Typography
                          fontWeight={900}
                          letterSpacing={3}
                          color="secondary.dark"
                        >
                          Chofer
                        </Typography>
                        <IconButton
                          color="default"
                          size="large"
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
                      <Box component={"div"}>
                        <Typography
                          fontWeight={900}
                          letterSpacing={3}
                          color="primary"
                        >
                          Transportista
                        </Typography>
                        <IconButton
                          color="primary"
                          aria-label="add an alarm"
                          sx={{ ...BoxShadoWButton }}
                          size="large"
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
                      <Box component={"div"}>
                        <Typography
                          textAlign={"center"}
                          fontWeight={900}
                          letterSpacing={10}
                          color="secondary.dark"
                        >
                          Vehiculos
                        </Typography>
                        <Box
                          component={"div"}
                          display={{ sm: "flex", xs: "block" }}
                          alignItems={"end"}
                          justifyContent={"space-around"}
                        >
                          <Box component={"div"}>
                            <Typography
                              fontSize={12}
                              fontWeight={800}
                              color="secondary.dark"
                            >
                              Principal
                            </Typography>
                            <IconButton
                              color="default"
                              aria-label="add an alarm"
                              sx={BoxShadoWButton}
                              onClick={(_e) =>
                                handleOpenModalForm(
                                  <DatosVehiculo
                                    onChange={handleVehiculoChange}
                                    initialValue={formik.values.vehiculo}
                                  />,
                                  "Vehiculo"
                                )
                              }
                            >
                              <LocalShippingIcon fontSize="large" />
                            </IconButton>
                          </Box>
                          <Box component={"div"} alignSelf={"start"}>
                            <Typography
                              fontSize={12}
                              fontWeight={800}
                              color="secondary.dark"
                            >
                              Secundarios
                            </Typography>
                            <IconButton
                              color="default"
                              aria-label="add an alarm"
                              disabled={
                                formik.values.vehiculo.placa === "" ? true : false
                              }
                              sx={BoxShadoWButton}
                              onClick={(_e) =>
                                handleOpenModalForm(
                                  <VehiculosSecundarios
                                    onConfirm={handleConfirmListVehiculo}
                                    vehiculos={formik.values.vehiculo.secundarios}
                                  />,
                                  "Vehiculo"
                                )
                              }
                            >
                              <AirportShuttleIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            {/* Conductores  transportistas y vehiculos*/}
            <TextField
              label='Observaciones'
              margin="normal"
              fullWidth
              value={formik.values.observacion}
              
            />
          </Grid>
          <Box display={"flex"} justifyContent={"center"}>
            <Button
              sx={{
                my: 4,
                color: "white",
                fontWeight: "bold",
                width: "70%",
              }}
              type="submit"
              variant="contained"
              color="warning"
            >
              Submit
            </Button>
          </Box>
        </form>
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
      </Container>
    </LocalizationProvider>
  );
};

export default GuiaRemisionMain;

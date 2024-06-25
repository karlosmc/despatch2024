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
  GuiaRemisionSchema,
  LlegadaSchema,
  TerceroSchema
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
  Modal,
  Paper,
  SxProps,

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
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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
import ObservacionesTextField from "../Observaciones";

import useAuthToken from "../../hooks/useAuthToken";

// import { useAuth } from "../../hooks/useAuth";

const VehiculoValues: EnvioVehiculo = {
  placa: "V0Z331",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: [],
};

const EnvioValues: Envio = {
  codTraslado: "02",
  desTraslado: "COMPRA",
  fecTraslado: dayjs().format("YYYY-MM-DD"),
  indicadores: [],
  indTransbordo: "",
  modTraslado: "02",
  numBultos: 0,
  pesoTotal: 1,
  undPesoTotal: "KGM",
  // pesoItems:0,
  // sustentoPeso:''
};

const DestinatarioDefaultValues: Client = {
  numDoc: "20119207640",
  rznSocial: "Estación de Energías el Centenario S.A.C",
  tipoDoc: "6",
}

const DatosGeneralesValues: DatosGenerales = {
  correlativo: "9",
  fechaEmision: dayjs().format("YYYY-MM-DD"),
  serie: "T002",
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
  tercero: {
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  envio: EnvioValues,
  addDocs: [

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

  partida: {
    id:0,
    codLocal: "0000",
    direccion: "",
    ruc: "",
    ubigeo: "",
  },
  llegada: {
    id:0,
    codLocal: "0000",
    direccion: "",
    ruc: "",
    ubigeo: "",
  },
  transportista: {
    id: 0,
    nroMtc: "",
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  observacion: ''
};

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const GuiaRemisionMain = () => {

  const { getError, getSuccess, getWarning } = useNotification();

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [base64Pdf, setBase64Pdf] = useState<string>('')

  const [accion, setAccion] = useState<string>('form')


  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>(initialValues.addDocs);

  const [detalles, setDetalles] = useState<Detail[]>(initialValues.details);


  const onHandlePreview = () => {
    setAccion('pdf');
    formik.submitForm();

  }

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  // const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS


  const { getToken, getSunatParams } = useAuthToken()

  const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS
  // console.log(API_GUIAS)

  const previewPDF = (values: GuiaRemision) => {


    const doc = {
      fechaEmision: values.datosGenerales.fechaEmision + ' ' + dayjs().format('HH:mm'),
      correlativo: values.datosGenerales.correlativo,
      serie: values.datosGenerales.serie,
      tipoDoc: values.datosGenerales.tipoDoc,
      version: values.datosGenerales.version,
      destinatario: values.destinatario,
      tercero: values.tercero.numDoc !== '' ? values.tercero : null,
      comprador: null,
      envio: {
        ...values.envio,
        partida: values.partida,
        llegada: values.llegada,
        vehiculo: values.vehiculo.placa !== '' ? values.vehiculo : null,
        aeropuerto: null,
        puerto: null,
        choferes: values.choferes,
        transportista: values.transportista.numDoc !== '' ? values.transportista : null
      },
      addDocs: values.addDocs,
      details: values.details,

    }

    const responsePdf = sendApi({ doc }, "/GeneraPdfDespatch");
    responsePdf.then(pdf => {
      setBase64Pdf(pdf.response.TramaPdf)
      handleOpen()
    });
  }

  const sendApi = async (param: any, api: string) => {
    const url = `${API_GUIAS}${api}`;

    const options = {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(param),
    };
    const resp = await fetch(url, options);
    return resp.json();
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {


      console.log(values)
      const fechaEmision = values.datosGenerales.fechaEmision;
      const fecTraslado = values.envio.fecTraslado;

      if (fecTraslado && fechaEmision) {

        const parseFechaEmision = new Date(fechaEmision)
        const parseFecTraslado = new Date(fecTraslado)

        // console.log(parseFecTraslado, parseFechaEmision)
        if (parseFecTraslado < parseFechaEmision) {
          getError('Datos de Envío: La fecha de traslado debe ser mayor a la fecha de Emisión de la Guía')
          return;
        }
      }
      if (accion === 'pdf') {
        previewPDF(values)
        setAccion('form')
        return;
      }

      const token = await getToken()
      if (token) {
        const doc = {
          // ...values.datosGenerales,
          fechaEmision: values.datosGenerales.fechaEmision + ' ' + dayjs().format('HH:mm'),
          correlativo: values.datosGenerales.correlativo,
          serie: values.datosGenerales.serie,
          tipoDoc: values.datosGenerales.tipoDoc,
          version: values.datosGenerales.version,
          destinatario: values.destinatario,
          tercero: values.tercero.numDoc !== '' ? values.tercero : null,
          comprador: null,
          envio: {
            ...values.envio,
            partida: values.partida,
            llegada: values.llegada,
            vehiculo: values.vehiculo.placa !== '' ? values.vehiculo : null,
            aeropuerto: null,
            puerto: null,
            choferes: values.choferes,
            transportista: values.transportista.numDoc !== '' ? values.transportista : null
          },
          addDocs: values.addDocs,
          details: values.details,

        }

        // console.log(doc)

        const data = await getSunatParams();

        if (data) {
          const x = Promise.resolve();
          x
            .then((_x) => sendApi({ doc }, "/GeneraXmlDespatch"))
            .then((res) => {
              const { response } = res;
              if (data.certificado === '') {
                getError('NO HAY UN TOKEN GENERADO');
                return;
              }
              // console.log(response);
              if (response.Exito) {
                const sign = {
                  'CertificadoDigital': data.certificado,
                  'PasswordCertificado': data.clavecertificado,
                  'TramaXmlSinFirma': res.response.TramaXmlSinFirma
                }
                return sign
              }
            })
            .then(sign => sendApi(sign, '/FirmarXml'))
            .then(resSign => {

              const { response } = resSign;
              if (response.Exito) {
                const request = {
                  'Ruc': '',
                  'EndPointUrl': data.urlsend,
                  'TramaXmlFirmado': response.TramaXmlFirmado,
                  'TipoDocumento': values.datosGenerales.tipoDoc,
                  'IdDocumento': values.datosGenerales.serie + '-' + values.datosGenerales.correlativo,
                  'token': token
                }
                // console.log('request',request);
                return request
              }
            })
            .then(send => sendApi(send, '/SendDespatch'))
            .then(resSend => {
              if (resSend.exito) {
                const consult = {
                  "access_token": token,
                  "EndPointUrl": `${data.urlconsult}${resSend.numTicket}`
                }
                // console.log(consult);
                return consult;
              }
            })
            .then(consult => sendApi(consult, '/ConsultaGuia'))
            .then(resConsult => {

              if (resConsult.error) {
                getError(resConsult.error.desError);
                return;
              }
              getSuccess(JSON.stringify(resConsult.CdrResponse));
              console.log(resConsult)
            });
        }

      } else {
        console.log('error al obtener el token')
      }



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

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1200,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  /* estilos */

  const onHandleDatosGeneralesChange = (datosGenerales: DatosGenerales) => {
    formik.setFieldValue("datosGenerales", datosGenerales);
  };

  const handleDestinatarioChange = (cliente: Client): void => {
    formik.setFieldValue("destinatario", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleProveedorChange = (cliente: Client) => {
    formik.setFieldValue("tercero", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleEnvioChange = (envio: Envio) => {
    formik.setFieldValue("envio", envio);
  };

  const handleNewAddDoc = (newAddDoc: AddDoc): void => {
    setAdicionalDocs((addDoc) => [...addDoc, newAddDoc]);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleDeleteAdddoc = (item: AddDoc): void => {
    const filterAdicionalDocs = adicionalDocs.filter(it => it.emisor !== item.emisor && it.nro !== item.nro);
    setAdicionalDocs(filterAdicionalDocs);
  }

  const handleNewDetail = (newDetail: Detail): void => {
    // console.log(newDetail)
    setDetalles((detalles) => [...detalles, newDetail]);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleDeleteDetail = (item: Detail): void => {
    // console.log(newDetail)
    const filterDetails = detalles.filter(it => it.codigo !== item.codigo);
    setDetalles(filterDetails);

  };

  const handlePartidaChange = (direccion: Direccion): void => {
    formik.setFieldValue("partida", direccion);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleLlegadaChange = (direccion: Direccion): void => {
    // console.log("entro");
    formik.setFieldValue("llegada", direccion);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleConfirmListVehiculo = (vehiculos: EnvioVehiculo[]): void => {
    formik.setFieldValue("vehiculo.secundarios", vehiculos);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleVehiculoChange = (vehiculo: EnvioVehiculo): void => {
    formik.setFieldValue("vehiculo", vehiculo);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleObservacionesChange = (observaciones: string): void => {
    formik.setFieldValue('observacion', observaciones)
    setModalsForms({ ...modalsForm, open: false })
  }

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

  useEffect(() => {
    if (formik.values.envio.codTraslado === '02' || formik.values.envio.codTraslado === '04') {
      formik.setFieldValue('destinatario', DestinatarioDefaultValues)
      if (formik.values.envio.codTraslado === '02') {
        getWarning('Proveedor: Registro Opcional. Si desea registre el proveedor dónde realizó la compra')
      }
    } else {
      formik.setFieldValue('destinatario', {
        numDoc: "",
        rznSocial: "",
        tipoDoc: "6",
      })
    }
  }, [formik.values.envio.codTraslado])

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
              sx={{ width: "100%", color: (expanded === "panel1" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Datos Generales
                </Typography>
                <FolderSharedIcon />
              </AccordionSummary>
              <AccordionDetails>
                <DatosGeneralesForm
                  onChange={onHandleDatosGeneralesChange}
                  datosGeneralesValues={formik.values.datosGenerales}
                />
              </AccordionDetails>
            </Accordion>
            {/* Datos generales */}


            {/* Envio */}
            <Accordion
              expanded={expanded === "panel3"}
              onChange={handleChange("panel3")}
              sx={{ width: "100%", color: (expanded === "panel3" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
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


            {/* Destinatario y comprador */}

            <Accordion
              expanded={expanded === "panel2"}
              onChange={handleChange("panel2")}
              sx={{ width: "100%", color: (expanded === "panel2" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Datos de destinatario y Proveedor
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
                              // initialValue={formik.values.envio.codTraslado === '02' ? DestinatarioDefaultValues : formik.values.destinatario}
                              onChange={handleDestinatarioChange}
                              tipo={formik.values.envio.codTraslado === '02' ? 'default' : ''}
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
                              initialValue={formik.values.tercero}
                              onChange={handleProveedorChange}
                              schema={TerceroSchema}
                              tipo="c"
                            />,
                            "Proveedor"
                          )
                        }
                        sx={{ height: 80, width: 100 }}
                      >
                        Proveedor
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>


            {/* Destinatario y comprador */}

            {/* Documentos Adicionales */}

            <Accordion
              expanded={expanded === "panel4"}
              onChange={handleChange("panel4")}
              sx={{ width: "100%", color: (expanded === "panel4" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
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
                  <DocumentosAdicionales onDelete={handleDeleteAdddoc} adicionales={formik.values.addDocs} />
                </Grid>


              </AccordionDetails>
            </Accordion>

            {/* Documentos Adicionales */}

            {/* Detalles */}

            <Accordion
              expanded={expanded === "panel5"}
              onChange={handleChange("panel5")}
              sx={{ width: "100%", color: (expanded === "panel5" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
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
                  <DocumentosDetalles onDelete={handleDeleteDetail} detalles={formik.values.details} />
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Detalles */}

            {/* Punto LLegada / Partida */}

            <Accordion
              expanded={expanded === "panel6"}
              onChange={handleChange("panel6")}
              sx={{ width: "100%", color: (expanded === "panel6" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
                aria-controls="panel6bh-content"
                id="panel6bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Punto de Partida y LLegada
                </Typography>
                <LocationOnIcon />

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
              sx={{ width: "100%", color: (expanded === "panel7" ? theme.palette.success.main : theme.palette.success.dark) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="secondary" fontSize="large" />}
                aria-controls="panel7bh-content"
                id="panel7bh-header"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }} fontWeight={700}>
                  Chofer / Transportista / Vehiculo
                </Typography>
                <BadgeIcon />
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
                          disabled={formik.values.envio.indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L') || formik.values.envio.modTraslado==='02'}
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
                                    vehiculos={formik.values.vehiculo?.secundarios}
                                  />,
                                  "Vehiculos secundarios"
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

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={(_e) =>
                handleOpenModalForm(
                  <ObservacionesTextField
                    // initialValue={formData.destinatario}
                    observaciones={formik.values.observacion}
                    onChange={handleObservacionesChange}
                  />,
                  "Observaciones"
                )
              }
              sx={{ mt: 2 }}
            // sx={{ height: 80, width: 100 }}
            >
              Observaciones
            </Button>



          </Grid>
          <Box display={"flex"} justifyContent={"center"} flexDirection={'row'} columnGap={2}>
            <Button onClick={onHandlePreview} variant="contained" sx={{ my: 4, color: "white", fontWeight: "bold" }} fullWidth>
              Ver Pdf
            </Button>
            <Button
              sx={{
                my: 4,
                color: "white",
                fontWeight: "bold",
              }}
              fullWidth
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
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"

        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Visor de Pdf
            </Typography>
            <Box sx={{ width: '100%', height: '70vh' }} component={'embed'} src={`data:application/pdf;base64,${base64Pdf}`} />
          </Box>
        </Modal>
      </Container>
    </LocalizationProvider>
  );
};

export default GuiaRemisionMain;

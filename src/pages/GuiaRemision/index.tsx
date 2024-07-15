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
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  SxProps,

  TextField,

  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import PinDropIcon from "@mui/icons-material/PinDrop";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CommuteIcon from "@mui/icons-material/Commute";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CloseIcon from '@mui/icons-material/Close';
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
import clienteAxios from "../../config/axios";
import { useAuth } from "../../hooks/useAuth";
import { puntoEmision } from "../../types/puntoemision.interface";
import { ParamsInterface } from "../../types/params.interface";
// import AppHeader from "../../components/Dashboard/AppHeader";
import axios from "axios";



// import { useAuth } from "../../hooks/useAuth";

const VehiculoValues: EnvioVehiculo = {
  id: 0,
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: [],
};

const EnvioValues: Envio = {
  codTraslado: "",
  desTraslado: "",
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

// const DestinatarioDefaultValues: Client = {
//   numDoc: "20119207640",
//   rznSocial: "Estación de Energías el Centenario S.A.C",
//   tipoDoc: "6",
// }

const DatosGeneralesValues: DatosGenerales = {
  correlativo: "0",
  fechaEmision: dayjs().format("YYYY-MM-DD"),
  serie: "",
  tipoDoc: "09",
  version: "2.0",
};

const initialValues: GuiaRemision = {
  datosGenerales: DatosGeneralesValues,
  destinatario: {
    id: 0,
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  tercero: {
    id: 0,
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  envio: EnvioValues,
  addDocs: [

  ],
  details: [],
  choferes: [],
  vehiculo: VehiculoValues,

  partida: {
    id: 0,
    codLocal: "0000",
    direccion: "",
    ruc: "",
    ubigeo: "",
    rznSocial: '',
  },
  llegada: {
    id: 0,
    codLocal: "0000",
    direccion: "",
    ruc: "",
    ubigeo: "",
    rznSocial: ''
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

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { getError, getSuccess, getWarning } = useNotification();
  const [backdropOpen, setBackdropOpen] = useState(false);

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [aceptada, setAceptada] = useState<boolean>(false)

  const [message, setMessage] = useState<string>('')

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openConfirmChofer, setOpenConfirmChofer] = useState<boolean>(false)

  const [procesoCompleto, setProcesoCompleto] = useState<boolean>(true)

  const [openConfirmVehiculo, setOpenConfirmVehiculo] = useState<boolean>(false)

  const [conductorFound, setConductorFound] = useState<EnvioChoferes[]>([])

  const [vehiculoFound, setVehiculoFound] = useState<EnvioVehiculo>(VehiculoValues)

  const [base64Pdf, setBase64Pdf] = useState<string>('')

  const [accion, setAccion] = useState<string>('form')

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>(initialValues.addDocs);

  // const [refresh, setRefresh] = useState<boolean>(false)

  const [detalles, setDetalles] = useState<Detail[]>(initialValues.details);

  const token = localStorage.getItem('AUTH_TOKEN');

  const [puntosEmision, setPuntosEmision] = useState<puntoEmision[]>([]);

  const [puntoEmisionSelected, setPuntoEmisionSelected] = useState<number>(0)

  const [params, setParams] = useState<ParamsInterface>(null)

  const [ticket, setTicket] = useState<string>('')

  const [est, setEst] = useState<number>(null)

  const [idDespatch, setIdDespatch] = useState<number>(null);

  const [consultToken, setConsultToken] = useState<string>('')


  const [hashQr, setHashQr] = useState<string>('');


  const { user } = useAuth({ middleware: '', url: '' });


  const getPuntosEmision = async () => {
    try {

      const { data, status } = await clienteAxios(`/api/usuario/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // console.log(data)
      if (status === 200) {
        setPuntosEmision(data)

      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
    }
  }

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

  const handleConfirmDialog = () => {
    formik.setFieldValue("choferes", conductorFound);
    setOpenConfirmChofer(false)
  }

  const handleConfirmVehiculoDialog = () => {
    formik.setFieldValue("vehiculo", vehiculoFound);
    setOpenConfirmVehiculo(false)
  }

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
      observacion: values.observacion,
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

    // console.log(JSON.stringify(doc));

    const responsePdf = sendApi({ doc }, "/GeneraPdfDespatch", '');

    responsePdf.then(pdf => {
      setBase64Pdf(pdf.response.TramaPdf)
      if (isMobile) {
        const link = document.createElement('a');
        link.href = `data:application/pdf; base64,${pdf.response.TramaPdf}`;
        // document.body.appendChild(link);
        link.download = `${doc.serie}-${doc.correlativo}.pdf`
        link.click();
        // document.body.removeChild(link);

      } else {
        handleOpen()
      }
      // handleOpen()
    });
  }

  const sendApi = async (param: any, api: string, process: string, timeout:boolean=false) => {
    const url = `${API_GUIAS}${api}`;
    setTimeoutMessage(process,timeout)
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


  const consultarToken = () => {

    if (ticket === '') {
      getError('Debe exister el número de TICKET');
      return;
    }
    const numeroDocumento = `${params.ruc}-${formik.values.datosGenerales.tipoDoc}-${formik.values.datosGenerales.serie}-${formik.values.datosGenerales.correlativo}`;
    const urlconsult = params.urlconsult;

    const consult = {
      "access_token": consultToken,
      "EndPointUrl": `${urlconsult}${ticket}`,
      numeroDocumento
    }

    sendApi(consult, '/ConsultaGuia', 'Consultando Ticket',true)
      .then(resConsult => {
        // console.log(resConsult)
        if (resConsult.error && resConsult.indCdrGenerado === "1") {
          getError(resConsult.error.desError);
          updateEstadoElectronico({
            'estado': 'C',
            // 'descripcion':'Documento consultado con Exito',
            'rutaCdr': `/CDR/`,
            'rutaPdf': `/PDF/`,
            'descripcion': resConsult.error.desError,
            'estadoSunat': resConsult.codRespuesta ? resConsult.codRespuesta : '',
            'codigoSunat': resConsult.error.numError,
            'cdrbase64': resConsult.arcCdr ? resConsult.arcCdr : '',
            'hashQr': resConsult.CdrResponse?.hashQr ? resConsult.CdrResponse.hashQr : '',
          }, est);
          setProcesoCompleto(false)
          return;
        }

        if (!resConsult.CdrResponse) {
          updateEstadoElectronico({
            'estado': 'C',
            // 'descripcion':'Documento consultado con Exito',
            'rutaCdr': `/CDR/`,
            'rutaPdf': `/PDF/`,
            'descripcion': 'PENDIENTE DE CONSULTA',
            'estadoSunat': resConsult.codRespuesta ? resConsult.codRespuesta : ''
          }, est);
          getWarning('Si ha generado el token y el ticket de consulta, presiona CONSULTAR');
          return;
          setProcesoCompleto(false)
        }

        updateEstadoElectronico({
          'estado': 'F',
          // 'descripcion':'Documento consultado con Exito',
          'rutaCdr': `/CDR/${numeroDocumento}.zip`,
          'rutaPdf': `/PDF/${numeroDocumento}.pdf`,
          'cdrbase64': resConsult.arcCdr ? resConsult.arcCdr : '',
          'hashQr': resConsult.CdrResponse?.hashQr ? resConsult.CdrResponse.hashQr : '',
          'descripcion': resConsult.CdrResponse?.Descripcion ? resConsult.CdrResponse.Descripcion : '',
          'estadoSunat': resConsult.codRespuesta ? resConsult.codRespuesta : '',
          'codigoSunat': resConsult.codRespuesta ? resConsult.codRespuesta : ''

        }, est);

        setHashQr(resConsult.CdrResponse.hashQr)
        getSuccess(resConsult.CdrResponse.Descripcion);
        setProcesoCompleto(false)

        if (resConsult.codRespuesta === "0") {

          // HandlePdfCompany(idDespatch)
          // setRefresh(true)
        }
        // console.log(resConsult)
      });


  }

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {

      // const fechaEmision = values.datosGenerales.fechaEmision;
      // const fecTraslado = values.envio.fecTraslado;

      const { observacion, destinatario, tercero, envio, addDocs, details, vehiculo, choferes, transportista, partida, llegada } = values;

      const { fechaEmision, correlativo, serie, tipoDoc, version } = values.datosGenerales;
      const { fecTraslado, indicadores } = envio;

      if (fecTraslado && fechaEmision) {

        const parseFechaEmision = new Date(fechaEmision)
        const parseFecTraslado = new Date(fecTraslado)

        if (parseFecTraslado < parseFechaEmision) {
          getError('Datos de Envío: La fecha de traslado debe ser mayor a la fecha de Emisión de la Guía')
          return;
        }
      }

      if (!indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L') && transportista.numDoc === '') {
        if (vehiculo.placa === '') {
          getError('Debe escribir una Placa');
          return;
        }
      }
      if (accion === 'pdf') {
        previewPDF(values)
        setAccion('form')
        return;
      }

      const doc = {
        // ...values.datosGenerales,
        fechaEmision: fechaEmision + ' ' + dayjs().format('HH:mm'),
        correlativo: correlativo,
        serie: serie,
        tipoDoc: tipoDoc,
        version: version,
        observacion: observacion,
        destinatario: destinatario,
        tercero: tercero.numDoc !== '' ? tercero : null,
        comprador: null,
        envio: {
          ...envio,
          partida: partida,
          llegada: llegada,
          vehiculo: vehiculo.placa !== '' ? vehiculo : null,
          aeropuerto: null,
          puerto: null,
          choferes: choferes,
          transportista: transportista.numDoc !== '' ? transportista : null
        },
        addDocs: addDocs,
        details: details,
      }

      const token_sunat = await getToken()
      if (token_sunat) {

        setProcesoCompleto(true)
        setBackdropOpen(true)

        if (idDespatch) {
          const respuesta = await updateGuia(doc);
          if (!respuesta.exito) {
            getError(respuesta.message);
            return;
          }
          procesoElectronico(doc, respuesta.electronico, token_sunat)

        } else {
          const respuesta = await storeGuia(doc);
          setIdDespatch(respuesta.despatch.id)
          setEst(respuesta.electronico)
          if (!respuesta.exito) {
            getError(respuesta.message);
            return;
          }
          procesoElectronico(doc, respuesta.electronico, token_sunat)
        }

      } else {
        console.log('error al obtener el token')
      }
    },
  });


  const HandlePdfCompany = (id: number) => {
    clienteAxios(`/api/despatches/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      const { status, data } = response;
      if (status || status === 200) {
        previewPDFQr(data?.data);
      }
    })
  }

  const previewPDFQr = (values: any) => {
    // console.log(values)

    // console.log(values.envio.indicadores)
    // console.log(values.envio.vehiculo)

    let vehiculos = values.envio.vehiculo?.length > 0 ? values.envio.vehiculo?.find(ve => ve.tipo === 'P') : null;
    let secundarios = values.envio.vehiculo?.length > 0 ? values.envio.vehiculo?.filter(ve => ve.tipo === 'S') : [];


    if (vehiculos) {
      // console.log(values.envio.vehiculo)
      // let secundarios = values.envio.vehiculo.filter(ve => ve.tipo === 'S') && [];
      // console.log(secundarios)
      vehiculos.secundarios = secundarios;
    }

    const doc = {
      ...values,
      tipoDoc: '09',
      envio: {
        ...values.envio,
        indicadores: values.envio.indicadores.map(indi => indi.indicador),
        vehiculo: vehiculos
      }

    }


    const responsePdf = sendApi({ doc }, "/GeneraPdfDespatch", '');

    responsePdf.then(pdf => {
      setBase64Pdf(pdf.response.TramaPdf)
      if (isMobile) {
        const link = document.createElement('a');
        link.href = `data:application/pdf; base64,${pdf.response.TramaPdf}`;
        // document.body.appendChild(link);
        link.download = `${doc.serie}-${doc.correlativo}.pdf`
        link.click();
        // document.body.removeChild(link);

      } else {
        handleOpen()
      }

      // setAccion('pdf')
    });
  }

  const handleBackdropPDfEmpresaClick = () => {
    HandlePdfCompany(idDespatch)
  }


  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleBackdropPDfSunatClick = async () => {
    setLoadingPdf(true);
    try {
      // const response = await axios.get('https://e-factura.sunat.gob.pe/v1/contribuyente/gre/comprobantes/descargaqr?hashqr=jNMQfx+wgqSxczqDe4SlHskqSTID3PdKjQzkoRtlthPyL7fQS57FJatUY+XowvZSvTsFtZ/DrcTX0rEak2M86+9CAwX6Fk177abLLPRihrA=', {
      const response = await axios.get(hashQr, {
        responseType: 'blob',
        timeout: 20000,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SUNAT_Hashqr.pdf'; // You can change the file name here
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.error('Download canceled', error.message);
      } else {
        console.error('Error downloading the file', error);
        getError('Error al descargar el documento')
      }
    } finally {
      setLoadingPdf(false);
    }
  };

  const procesoElectronico = async (doc, estadoElectronico, token_sunat) => {
    if (!params) return;
    const numeroDocumento = `${params.ruc}-${doc.tipoDoc}-${doc.serie}-${doc.correlativo}`;
    try {
      const xmlRes = await sendApi({ doc }, "/GeneraXmlDespatch", 'Generando XML ...');
      if (!params.certificado) {
        getError('NO HAY UN TOKEN GENERADO');
        return;
      }

      if (xmlRes.response.Exito) {
        await updateEstadoElectronico({
          estado: 'G',
          descripcion: 'Documento Generado con Exito',
          rutaXml: `/XML/${numeroDocumento}.xml`
        }, estadoElectronico);

        const sign = {
          CertificadoDigital: params.certificado,
          PasswordCertificado: params.clavecertificado,
          TramaXmlSinFirma: xmlRes.response.TramaXmlSinFirma,
          numeroDocumento
        };

        const signRes = await sendApi(sign, '/FirmarXml', 'Firmando XML...');
        if (signRes.response.Exito) {
          await updateEstadoElectronico({
            estado: 'F',
            descripcion: 'Documento Firmado con Exito',
            hash: signRes.response.ResumenFirma
          }, estadoElectronico);

          const sendReq = {
            Ruc: '',
            EndPointUrl: params.urlsend,
            TramaXmlFirmado: signRes.response.TramaXmlFirmado,
            TipoDocumento: doc.tipoDoc,
            IdDocumento: `${doc.serie}-${doc.correlativo}`,
            token: token_sunat
          };

          const sendRes = await sendApi(sendReq, '/SendDespatch', 'Enviando Guiá electrónica');
          if (sendRes.exito) {
            setConsultToken(token_sunat);
            setTicket(sendRes.numTicket);
            await updateEstadoElectronico({
              estado: 'S',
              descripcion: 'Documento enviado con Exito',
              token_sunat,
              ticket: sendRes.numTicket
            }, estadoElectronico);

            const consultReq = {
              access_token: token_sunat,
              EndPointUrl: `${params.urlconsult}${sendRes.numTicket}`,
              numeroDocumento
            };

            const consultRes = await sendApi(consultReq, '/ConsultaGuia', 'Consultando Ticket');
            if (consultRes.error) {
              getError(consultRes.error.desError);
              await updateEstadoElectronico({
                estado: 'C',
                descripcion: consultRes.error.desError,
                estadoSunat: consultRes.codRespuesta || '',
                codigoSunat: consultRes.error.numError,
                cdrbase64: consultRes.arcCdr || '',
                hashQr: consultRes.CdrResponse?.hashQr || ''
              }, estadoElectronico);

              // setBackdropOpen(false)
              setProcesoCompleto(false)
              return;
            }

            const descripcion = consultRes.CdrResponse?.Descripcion || 'PENDIENTE DE CONSULTA';
            const estadoSunat = consultRes.codRespuesta || '';
            await updateEstadoElectronico({
              estado: 'F',
              rutaCdr: `/CDR/${numeroDocumento}.zip`,
              rutaPdf: `/CDR/${numeroDocumento}.pdf`,
              cdrbase64: consultRes.arcCdr || '',
              hashQr: consultRes.CdrResponse?.hashQr || '',
              descripcion,
              estadoSunat
            }, estadoElectronico);

            setProcesoCompleto(false)

            setHashQr(consultRes.CdrResponse?.hashQr);
            getSuccess(descripcion);

            if (consultRes.codRespuesta === "0") {
              setAceptada(true)
              
              // HandlePdfCompany(despacho);

              // setRefresh(true);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const storeGuia = async (values: any) => {
    try {

      // console.log(values)
      // const doc = {
      //   // ...values.datosGenerales,
      //   fechaEmision: values.datosGenerales.fechaEmision + ' ' + dayjs().format('HH:mm'),
      //   correlativo: values.datosGenerales.correlativo,
      //   serie: values.datosGenerales.serie,
      //   tipoDoc: values.datosGenerales.tipoDoc,
      //   version: values.datosGenerales.version,
      //   observacion: values.observacion,
      //   destinatario: values.destinatario,
      //   tercero: values.tercero.numDoc !== '' ? values.tercero : null,
      //   comprador: null,
      //   envio: {
      //     ...values.envio,
      //     partida: values.partida,
      //     llegada: values.llegada,
      //     vehiculo: values.vehiculo.placa !== '' ? values.vehiculo : null,
      //     aeropuerto: null,
      //     puerto: null,
      //     choferes: values.choferes,
      //     transportista: values.transportista.numDoc !== '' ? values.transportista : null
      //   },
      //   addDocs: values.addDocs,
      //   details: values.details,
      // }

      const { data, status } = await clienteAxios.post(`/api/despatches/`, { ...values }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // console.log(data)
      if (status === 200) {
        return data;
      } else {
        return null;
      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
      return null;
    }
  }


  const updateGuia = async (values: any) => {
    try {

      // console.log(values)
      // const doc = {
      //   // ...values.datosGenerales,
      //   fechaEmision: values.datosGenerales.fechaEmision + ' ' + dayjs().format('HH:mm'),
      //   correlativo: values.datosGenerales.correlativo,
      //   serie: values.datosGenerales.serie,
      //   tipoDoc: values.datosGenerales.tipoDoc,
      //   version: values.datosGenerales.version,
      //   observacion: values.observacion,
      //   destinatario: values.destinatario,
      //   tercero: values.tercero.numDoc !== '' ? values.tercero : null,
      //   comprador: null,
      //   envio: {
      //     ...values.envio,
      //     partida: values.partida,
      //     llegada: values.llegada,
      //     vehiculo: values.vehiculo.placa !== '' ? values.vehiculo : null,
      //     aeropuerto: null,
      //     puerto: null,
      //     choferes: values.choferes,
      //     transportista: values.transportista.numDoc !== '' ? values.transportista : null
      //   },
      //   addDocs: values.addDocs,
      //   details: values.details,
      // }

      const { data, status } = await clienteAxios.put(`/api/despatches/${idDespatch}`, { ...values }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // console.log(data)
      if (status === 200) {
        return data;
      } else {
        return null;
      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
      return null;
    }
  }

  const updateEstadoElectronico = async (values: any, id: number) => {

    try {
      const { data, status } = await clienteAxios.put(`/api/estadoelectronico/${id}`, {

        ...values
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(data)

      // console.log(data)
      if (status === 200) {

      }
    }
    catch (error) {
      console.log(error)
    }
  }

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


  // useEffect(() => {

  //   if (hashQr !== '') {

  //     setTimeout(() => {
  //       window.open(hashQr, '_blank');
  //     }, 3000);

  //     setTimeout(() =>
  //       setHashQr('')
  //       , 2000)
  //   }

  // }, [hashQr])


  const ActualizarPagina = () => {
    window.location.href = window.location.href;
  }


  const getParams = async () => {
    const data = await getSunatParams();
    setParams(data)
  }

  useEffect(() => {
    getParams()
  }, [])



  const SearchConductorByNrodoc = async (nrodoc: string) => {
    try {

      const { data, status } = await clienteAxios(`/api/conductor/buscar?nroDoc=${nrodoc}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 200) {
        // setIsLoading(false)
        // setDataFilter(data?.data)
        // console.log(data.data)
        if (data?.data.length > 0) {

          const choferes: EnvioChoferes[] = [{
            apellidos: data.data[0].apellidos,
            licencia: data.data[0].licencia,
            nombres: data.data[0].nombres,
            nroDoc: data.data[0].nroDoc,
            tipoDoc: data.data[0].tipoDoc,
            tipo: 'Principal',
            id: data.data[0].id,
          }]

          setConductorFound(choferes)
          setOpenConfirmChofer(true)
        }
        // console.log(data)
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {

    if (user) {
      SearchConductorByNrodoc(user.documento);
    }

  }, [user])


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

  const onHandleSelectSerie = (vehiculo: EnvioVehiculo): void => {
    // console.log(vehiculo)
    // formik.setFieldValue("vehiculo", vehiculo);
    // formik.setFieldValue("vehiculo", vehiculo);

    setVehiculoFound(vehiculo)
    setOpenConfirmVehiculo(true)
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

    if (formik.values.envio.codTraslado === '02') {
      getWarning('Proveedor: Registro Opcional. Si desea registre el proveedor dónde realizó la compra')
    }

  }, [formik.values.envio.codTraslado])

  const handleConfirmListaChoferes = (choferes: EnvioChoferes[]): void => {
    // console.log(choferes)
    formik.setFieldValue("choferes", choferes);
    setModalsForms({ ...modalsForm, open: false });
  };

  const onHandleChangePuntoEmision = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPuntoEmisionSelected(parseInt(e.target.value));
  }

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

  const setTimeoutMessage = (mensaje: string, timeout: boolean = false) => {
    setMessage(mensaje)

    if (timeout) {
      setTimeout(() => {
        setMessage('')
      }, 2000);
    }
    // setTimeout(() => {
    //   setMessage('')
    // }, 2000);
  }

  useEffect(() => {
    if (user) {
      getPuntosEmision()
    }
  }, [user])



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography textAlign={'center'} variant="h4" my={3}>GUIA DE REMISIÓN ELECTRÓNICA</Typography>

        <Box px={2} mb={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="">
              Puntos de emisión del usuario
            </InputLabel>
            <Select
              fullWidth
              labelId=""
              label="Puntos de emisión del usuario"
              onChange={onHandleChangePuntoEmision}
              value={puntoEmisionSelected}
              name="puntoemision"
            >
              <MenuItem value={0}>...Elija un punto de emision...</MenuItem>
              {
                puntosEmision?.map(pe => (
                  <MenuItem key={pe.id} value={pe.id}>{pe.nombre}</MenuItem>
                ))
              }

            </Select>

          </FormControl>
        </Box>
        <Box component={'form'} onSubmit={formik.handleSubmit}>
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
                  onSelectSerie={onHandleSelectSerie}
                  puntoEmision={puntoEmisionSelected}
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
                              tipo={formik.values.envio.codTraslado === '02' || formik.values.envio.codTraslado === '04' ? 'default' : ''}
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
                      rowGap={3}
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
                          disabled={formik.values.envio.indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L') && formik.values.envio.modTraslado === '02'}
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

                        {formik.values.choferes.map(cho => (
                          <Typography key={cho.id} sx={{ fontSize: cho.tipo === 'Principal' ? 12 : 11 }} color={cho.tipo === 'Principal' ? 'warning.dark' : 'warning.light'} >{cho.tipo.substring(0, 3).toUpperCase()}: {cho.nombres} {cho.apellidos}</Typography>
                        ))}

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
                          disabled={formik.values.envio.indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L') || formik.values.envio.modTraslado === '02'}
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
                        {
                          formik.values.vehiculo.placa !== '' &&
                          (<Typography sx={{ fontSize: 12 }} color="warning.dark">Principal: {formik.values.vehiculo.placa}</Typography>)
                        }
                        {formik.values.vehiculo.secundarios.map(veh => (
                          <Typography key={veh.id} sx={{ fontSize: 11 }} color={'warning.light'} >Secundario: {veh.placa}</Typography>
                        ))}
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

            <Box sx={{ width: '100%' }} columnGap={2} display={"flex"} flexDirection={'row'} mt={2} alignItems={'baseline'}>
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                fullWidth
                label='Token'
                name="token"
                sx={{ display: 'none' }}
                value={consultToken}
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                fullWidth
                label='Ticket'
                name="ticket"
                value={ticket}
                InputProps={{ readOnly: true }}
              />
              <Button onClick={consultarToken} fullWidth size="small" variant="contained" color="error" sx={{ height: 40 }}>
                Consultar
              </Button>

            </Box>

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
              disabled={aceptada}
            >
              Enviar
            </Button>
          </Box>

          <Button fullWidth onClick={ActualizarPagina} color="warning" variant="contained" sx={{ mb: 2 }}>
            Actualizar página
          </Button>
          {aceptada &&

            <Box my={3} display={'flex'} flexDirection={'row'} gap={2} justifyContent={'center'}>
              <Box
                component={Button}
                display={"flex"}
                flexDirection={"column"}
                variant="contained"
                sx={{
                  height: 80,
                  width: 100,
                  padding: theme.spacing(2),
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.light,
                  },
                  backgroundColor: theme.palette.secondary.main,
                  color: '#fff',
                }}
                onClick={handleBackdropPDfSunatClick}
              >
                {loadingPdf ? <CircularProgress color="inherit" /> : <PictureAsPdfIcon fontSize="large" />}
                <Typography sx={{ fontSize: 10, fontWeight: 800 }} pt={1}>PDF SUNAT</Typography>
              </Box>
              <Box
                component={Button}
                display={"flex"}
                flexDirection={"column"}
                variant="contained"
                sx={{
                  height: 80,
                  width: 100,
                  padding: theme.spacing(2),
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark,
                  },
                  backgroundColor: theme.palette.error.main,
                  color: '#fff',
                }}
                onClick={handleBackdropPDfEmpresaClick}
              >
                <PictureAsPdfIcon fontSize="large" />
                <Typography sx={{ fontSize: 8, fontWeight: 800 }} pt={1}>PDF EMPRESA</Typography>
              </Box>
            </Box>
          }
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

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="xs"
          open={openConfirmChofer}
        >
          <DialogTitle>Conductor encontrado</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>

            <Typography>El conductor con DNI {conductorFound.length > 0 ? conductorFound[0].nroDoc : ''} está relacionado al Usuario</Typography>
            <Typography>¿Desea asignarlo como conductor Principal en esta GUIA?</Typography>

          </DialogContent>

          <DialogActions>
            <Button onClick={handleConfirmDialog} variant="contained" color="success">Asignar</Button>
            <Button onClick={() => setOpenConfirmChofer(false)} variant="contained" color="error">Cancelar</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="xs"
          open={openConfirmVehiculo}
        >
          <DialogTitle>Vehiculo encontrado</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>

            <Typography>La serie tiene por defecto el vehiculo primario con Placa {vehiculoFound.placa}</Typography>
            {vehiculoFound.secundarios.length > 0 && <Typography>Y el vehiculo Secundario con Placa {vehiculoFound.secundarios[0].placa}</Typography>}
            <Typography>¿Desea asignarlo en la GUIA?</Typography>

          </DialogContent>

          <DialogActions>
            <Button onClick={handleConfirmVehiculoDialog} variant="contained" color="success">Asignar</Button>
            <Button onClick={() => setOpenConfirmVehiculo(false)} variant="contained" color="error">Cancelar</Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Backdrop
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        open={backdropOpen}
      >
        <IconButton
          color="default"
          sx={{
            position: 'absolute',
            border: '3px solid',
            borderColor: 'inherit',
            top: '100px'
          }}
          onClick={() => setBackdropOpen(false)}>
          <CloseIcon />
        </IconButton>
        {procesoCompleto && <CircularProgress color="inherit" />}
        <Box width={isMobile ? '100%' : '50%'}
          // position={'fixed'} 
          // zIndex={99999999} 
          style={{
            bottom: '50%',
            // left: '50%',
            // transform: 'translate(-50%, 50%)',
            marginBottom: "1.5rem"
          }}
          px={4} textAlign={'center'} >
          {message !== "" ? <Alert variant="filled" sx={{ color: 'white' }} severity="success">{message}</Alert> : ""}
        </Box>

        {aceptada &&

          <Box mt={5} display={'flex'} flexDirection={'row'} gap={2} justifyContent={'space-between'}>
            <Box
              component={Button}
              display={"flex"}
              flexDirection={"column"}
              variant="contained"
              sx={{
                height: 80,
                width: 100,
                padding: theme.spacing(2),
                borderRadius: theme.shape.borderRadius,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.light,
                },
                backgroundColor: theme.palette.secondary.main,
                color: '#fff',
              }}
              onClick={handleBackdropPDfSunatClick}
            >
              {loadingPdf ? <CircularProgress color="inherit" /> : <PictureAsPdfIcon fontSize="large" />}
              <Typography sx={{ fontSize: 10, fontWeight: 800 }} pt={1}>PDF SUNAT</Typography>
            </Box>
            <Box
              component={Button}
              display={"flex"}
              flexDirection={"column"}
              variant="contained"
              sx={{
                height: 80,
                width: 100,
                padding: theme.spacing(2),
                borderRadius: theme.shape.borderRadius,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
                backgroundColor: theme.palette.error.main,
                color: '#fff',
              }}
              onClick={handleBackdropPDfEmpresaClick}
            >
              <PictureAsPdfIcon fontSize="large" />
              <Typography sx={{ fontSize: 8, fontWeight: 800 }} pt={1}>PDF EMPRESA</Typography>
            </Box>
          </Box>
        }
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

      </Backdrop>
    </LocalizationProvider>
  );
};

export default GuiaRemisionMain;

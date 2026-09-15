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
import ObservacionesTextField from "../Observaciones";



import { puntoEmision } from "../../types/puntoemision.interface";

// import AppHeader from "../../components/Dashboard/AppHeader";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ProcesarGuiaModal } from "./ProcesarGuia";

import { GuiaServices } from "../../service/GuiaServices";
import { PuntoEmisionService } from "../../service/PuntoEmisionService";
import { ConductoresService } from "../../service/ConductoresServices";
import { GuiaElectronicaService } from "../../service/GuiaElectronicaService";



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

  const navigate = useNavigate();
  const { getError, getSuccess } = useNotification();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [openPreview, setOpenPreview] = useState(false);

  const [openConfirmChofer, setOpenConfirmChofer] = useState<boolean>(false)

  const [openConfirmVehiculo, setOpenConfirmVehiculo] = useState<boolean>(false)

  const [conductorFound, setConductorFound] = useState<EnvioChoferes[]>([])

  const [vehiculoFound, setVehiculoFound] = useState<EnvioVehiculo>(VehiculoValues)

  const [base64Pdf, setBase64Pdf] = useState<string>('')

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>(initialValues.addDocs);

  const [datosParaProcesar, setDatosParaProcesar] = useState(null)

  const [detalles, setDetalles] = useState<Detail[]>(initialValues.details);

  const [puntosEmision, setPuntosEmision] = useState<puntoEmision[]>([]);

  const [puntoEmisionSelected, setPuntoEmisionSelected] = useState<number>(0)

  const [estadoElectronico, setEstadoElectronico] = useState<null>(null)

  const [idDespatch, setIdDespatch] = useState<number>(null);

  const user = useAuthStore(state => state.user);


  const handleProcesoSuccess = (resultado: any): void => {
    console.log('Proceso completado exitosamente:', resultado);
    getSuccess('Guia enviada correctamente a SUNAT');
    setTimeout(() => {
      navigate('/admin/guias');
    }, 2000);
  };

  const handleProcesoError = (error: any): void => {
    console.error('Error en el proceso:', error);
    // Convertir el error a string de forma segura
    let errorMessage = 'Error en el proceso de la guía electrónica';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }
    // Mostrar notificación de error al usuario
    getError(errorMessage);
  };

  const handleModalClose = (): void => {
    setModalOpen(false);

  };

  const handleOpenPreview = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);


  const getPuntosEmision = async () => {
    try {

      const response = await PuntoEmisionService.getPuntosByUserId(user.id)
      setPuntosEmision(response)

    }
    catch (error: any) {
      console.log(error || 'Hubo un error al obtener los puntos de emisión del usuario')
    }
  }

  const onHandlePreview = async () => {
    // setAccion('pdf');
    // formik.submitForm();
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
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
    } else {
      previewPDF(formik.values);
    }

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


  // console.log(API_GUIAS)

  const previewPDF = async (values: GuiaRemision) => {
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

    const { response } = await GuiaElectronicaService.getPdfPreview(doc);

    if (response.TramaPdf) {

      setBase64Pdf(response.TramaPdf)
      if (isMobile) {
        const link = document.createElement('a');
        link.href = `data:application/pdf; base64,${response.TramaPdf}`;
        // document.body.appendChild(link);
        link.download = `${doc.serie}-${doc.correlativo}.pdf`
        link.click();
        // document.body.removeChild(link);

      } else {

        handleOpenPreview()
      }
    }
  }

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      try {
        const { observacion, destinatario, tercero, envio, addDocs, details, vehiculo, choferes, transportista, partida, llegada } = values;
        const { fechaEmision, correlativo, serie, tipoDoc, version } = values.datosGenerales;
        const { fecTraslado, indicadores } = envio;

        // Validación de fechas
        if (fecTraslado && fechaEmision) {
          const parseFechaEmision = new Date(fechaEmision);
          const parseFecTraslado = new Date(fecTraslado);

          if (isNaN(parseFechaEmision.getTime()) || isNaN(parseFecTraslado.getTime())) {
            getError('Las fechas ingresadas no son válidas');
            return;
          }

          // Validación de rango de fecha de emisión
          const fechaActual = new Date();
          
          
          const dosDiasAdelante = new Date(fechaActual);
          dosDiasAdelante.setDate(fechaActual.getDate() + 2);

          // Resetear horas para comparar solo fechas
          const fechaEmisionSinHora = new Date(parseFechaEmision.getFullYear(), parseFechaEmision.getMonth(), parseFechaEmision.getDate());
          // const unDiaAtrasSinHora = new Date(unDiaAtras.getFullYear(), unDiaAtras.getMonth(), unDiaAtras.getDate());
          const dosDiasAdelanteSinHora = new Date(dosDiasAdelante.getFullYear(), dosDiasAdelante.getMonth(), dosDiasAdelante.getDate());

          // if (fechaEmisionSinHora < unDiaAtrasSinHora) {
          //   getError('La fecha de emisión no puede ser anterior a 1 día de la fecha actual');
          //   return;
          // }

          if (fechaEmisionSinHora > dosDiasAdelanteSinHora) {
            getError('La fecha de emisión no puede ser posterior a 2 días de la fecha actual');
            return;
          }

          if (parseFecTraslado < parseFechaEmision) {
            getError('Datos de Envío: La fecha de traslado debe ser mayor a la fecha de Emisión de la Guía');
            return;
          }
        }

        // Validación de vehículo y transportista
        if (!indicadores.includes('SUNAT_Envio_IndicadorTrasladoVehiculoM1L') && transportista.numDoc === '') {
          if (vehiculo.placa === '') {
            getError('Debe escribir una Placa');
            return;
          }
        }

        // Validación de destinatario
        if (!destinatario || !destinatario.numDoc) {
          getError('Debe especificar un destinatario válido');
          return;
        }

        // Validación de direcciones
        if (!partida || !partida.direccion) {
          getError('Debe especificar una dirección de partida');
          return;
        }

        if (!llegada || !llegada.direccion) {
          getError('Debe especificar una dirección de llegada');
          return;
        }

        // Validación de detalles
        if (!details || details.length === 0) {
          getError('Debe agregar al menos un producto/detalle');
          return;
        }

        if( values.envio.modTraslado === '01' && values.choferes.length > 0 && values.envio.fecInicioTrasladoBienes){
          getError('Datos de Envío: La fecha de inicio de traslado de bienes debe elegirse');
          return;
        }

        if( values.envio.modTraslado === '01' && values.choferes.length === 0){
          values.envio.fecInicioTrasladoBienes = fecTraslado
        }
        if (values.envio.modTraslado === '02') {
          values.envio.fecInicioTrasladoBienes = null;
        }

        // Construcción del documento
        const doc = {
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
        };

        // setBackdropOpen(true);
        setDatosParaProcesar(doc);

        // Guardar o actualizar
        let response;
        if (idDespatch) {
          response = await GuiaServices.update(doc, idDespatch);

        } else {
          response = await GuiaServices.save(doc);
          setIdDespatch(response?.despatch?.id);
          setEstadoElectronico(response?.electronico);
        }

        if (!response || !response.exito) {

          // setBackdropOpen(false);
          getError(response?.message || 'Error al procesar la guía');
          return;
        }
        getSuccess('La guía se guardó correctamente, se procede a enviar a SUNAT');

        setModalOpen(true);

      } catch (error) {

        // setBackdropOpen(false);
        const errorMessage = error instanceof Error ? error.message : 'Error inesperado al procesar la guía';
        getError(errorMessage);
        console.error('Error en onSubmit:', error);
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



  const SearchConductorByNrodoc = async (nrodoc: string) => {
    try {

      const { data } = await ConductoresService.getConductorByNroDoc(nrodoc);
      if (data.length > 0) {

        const chofer = data[0];

        const choferes: EnvioChoferes[] = [{
          apellidos: chofer.apellidos,
          licencia: chofer.licencia,
          nombres: chofer.nombres,
          nroDoc: chofer.nroDoc,
          tipoDoc: chofer.tipoDoc,
          tipo: 'Principal',
          id: chofer.id,
        }];
        setConductorFound(choferes)
        setOpenConfirmChofer(true)
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
    alignItems: 'center',
    // flexWrap: "wrap",
    flexDirection: 'column',
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

    if (vehiculo.placa) {
      setVehiculoFound(vehiculo)
      setOpenConfirmVehiculo(true)
    }
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

  // useEffect(() => {

  //   if (formik.values.envio.codTraslado === '02') {
  //     getWarning('Proveedor: Registro Opcional. Si desea registre el proveedor dónde realizó la compra')
  //   }

  // }, [formik.values.envio.codTraslado])

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
    console.log(transportista);
    formik.setFieldValue("transportista", transportista);
    setModalsForms({ ...modalsForm, open: false });
  };


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
                    <Paper elevation={5} sx={paperClient} style={{ flexDirection: 'column', alignItems: 'center' }}>
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
                      <Box display={'flex'} flexDirection={'column'} mt={1}>
                        <Typography sx={{ fontSize: 12 }} color={theme.palette.text.disabled} >{formik.values.destinatario?.numDoc}</Typography>
                        <Typography sx={{ fontSize: 11 }} color={theme.palette.text.disabled} >{formik.values.destinatario?.rznSocial}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={5} sx={paperClient} style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        color="warning"
                        disabled={formik.values?.envio?.codTraslado === '04'}
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
                      <Box display={'flex'} flexDirection={'column'} mt={1}>
                        <Typography sx={{ fontSize: 12 }} color={theme.palette.text.disabled} >{formik.values.tercero?.numDoc}</Typography>
                        <Typography sx={{ fontSize: 11 }} color={theme.palette.text.disabled} >{formik.values.tercero?.rznSocial}</Typography>
                      </Box>
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
                      <Box display={'flex'} flexDirection={'column'} alignItems={'center'} mt={1}>
                        <Typography sx={{ fontSize: 12 }} >{formik.values.partida?.ruc}</Typography>
                        <Typography sx={{ fontSize: 12 }} >{formik.values.partida?.rznSocial}</Typography>
                        <Typography sx={{ fontSize: 11 }} color={theme.palette.text.disabled} >{formik.values.partida?.direccion}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} mt={{ xs: 1, sm: 0 }}>
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
                      <Box display={'flex'} flexDirection={'column'} mt={1}>
                        <Typography sx={{ fontSize: 12 }} >{formik.values.llegada?.ruc}</Typography>
                        <Typography sx={{ fontSize: 12 }} >{formik.values.llegada?.rznSocial}</Typography>
                        <Typography sx={{ fontSize: 11 }} color={theme.palette.text.disabled} >{formik.values.llegada?.direccion}</Typography>
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

                    <Grid item container justifyContent={'space-evenly'}>
                      <Grid item sm={4} xs={6}>
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
                            <Typography key={cho.id} sx={{ fontSize: cho.tipo === 'Principal' ? 11 : 10 }} color={cho.tipo === 'Principal' ? 'warning.dark' : 'warning.light'} >{cho.tipo.substring(0, 3).toUpperCase()}: {cho.nombres} {cho.apellidos}</Typography>
                          ))}

                        </Box>
                      </Grid>
                      <Grid item sm={4} xs={6}>
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
                          {formik.values.transportista.numDoc !== '' &&
                            <Box display={'flex'} flexDirection={'column'} mt={1}>
                              <Typography sx={{ fontSize: 12 }} color={theme.palette.text.secondary} >{formik.values.transportista?.numDoc}</Typography>
                              <Typography sx={{ fontSize: 12 }} color={theme.palette.text.secondary} >{formik.values.transportista?.rznSocial}</Typography>
                              <Typography sx={{ fontSize: 11 }} color={theme.palette.text.disabled} >{formik.values.transportista?.nroMtc}</Typography>
                            </Box>
                          }
                          {/* <h1>{formik.values.transportista.numDoc}</h1> */}
                        </Box>
                      </Grid>
                      <Grid item sm={4} xs={12}>
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
                            display={{ xs: "flex" }}
                            alignItems={"end"}
                            justifyContent={"center"}
                            columnGap={2}
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
                            (<Typography sx={{ fontSize: 11 }} color="warning.dark">Principal: {formik.values.vehiculo.placa}</Typography>)
                          }
                          {formik.values.vehiculo?.secundarios?.map(veh => (
                            <Typography key={veh.id} sx={{ fontSize: 10 }} color={'warning.light'} >Secundario: {veh.placa}</Typography>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
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
              sx={{ marginY: 2 }}
            // sx={{ height: 80, width: 100 }}
            >
              Observaciones
            </Button>



          </Grid>

          <Button onClick={onHandlePreview} variant="contained" sx={{ my: 1, color: "white", fontWeight: "bold" }} fullWidth>
            Vista previa de PDF
          </Button>
          <Button
            sx={{
              my: 1,
              color: "white",
              fontWeight: "bold",
            }}
            fullWidth
            type="submit"
            variant="contained"
            color="warning"
          >
            Enviar
          </Button>

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
          open={openPreview}
          onClose={handleClosePreview}
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
          <DialogTitle>
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
              <AssignmentIndIcon color="warning" sx={{ fontSize: '70px' }} />
              <Typography variant="subtitle2" color='text.secondary' textAlign={'center'}>Conductor encontrado</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>

            <Typography variant="body2">El conductor con DNI {conductorFound.length > 0 ? conductorFound[0].nroDoc : ''} está relacionado al Usuario</Typography>
            <Typography variant="body2">¿Desea asignarlo como conductor Principal en esta GUIA?</Typography>

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
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
            <LocalShippingIcon color="warning" sx={{ fontSize: '70px' }} />
            <Typography variant="subtitle2" color='text.secondary' textAlign={'center'}>Vehiculo encontrado</Typography>
          </Box>
          <DialogContent sx={{ textAlign: 'center' }}>

            <Typography variant="body2">La serie tiene por defecto el vehiculo primario con Placa {vehiculoFound.placa}</Typography>
            {vehiculoFound.secundarios.length > 0 && <Typography variant="body2">Y el vehiculo Secundario con Placa {vehiculoFound.secundarios[0].placa}</Typography>}
            <Typography variant="body2">¿Desea asignarlo en la GUIA?</Typography>

          </DialogContent>

          <DialogActions>
            <Button onClick={handleConfirmVehiculoDialog} variant="contained" color="success">Asignar</Button>
            <Button onClick={() => setOpenConfirmVehiculo(false)} variant="contained" color="error">Cancelar</Button>
          </DialogActions>
        </Dialog>
      </Container>

      <ProcesarGuiaModal
        open={modalOpen}
        onClose={handleModalClose}
        datosGuia={datosParaProcesar}
        onSuccess={handleProcesoSuccess}
        onError={handleProcesoError}
        idElectronico={estadoElectronico}
      />
    </LocalizationProvider>
  );
};

export default GuiaRemisionMain;

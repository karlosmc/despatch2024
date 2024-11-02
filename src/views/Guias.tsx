
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,


  FormControl,


  InputLabel,


  ListItem,


  MenuItem,


  Modal,
  Paper,

  Select,

  styled,

  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,

  TextField,

  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import clienteAxios from "../config/axios";

// import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import DoDisturbIcon from '@mui/icons-material/DoDisturb';


import FindInPageIcon from "@mui/icons-material/FindInPage";
import { DialogComponentCustom } from "../components";

import QRCode from "qrcode.react";

// import ModalConductor from "../components/Conductor";
import { panelguia } from "../types/panelguia.interface";

import { useNotification } from "../context/notification.context";
import { ParamsInterface } from "../types/params.interface";
import useAuthToken from "../hooks/useAuthToken";
import { useAuth } from "../hooks/useAuth";
import { BuscarOpcionesInterface } from "../types/buscar.interface";
import BuscarComponent from "../components/BuscarComponent";
// import { GuiaRemision } from "../types/guias/guiaremision.interface";
// import { Link } from "react-router-dom";

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const stylePdf = {
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

const BoxShadowButton = {
  cursor: 'pointer',
  boxShadow: "0 0 10px #949494",
  backgroundColor: 'transparent',
  // borderRadius: '100%',
  "&:hover": {
    animation: "animatedButton 1.5s ease-in-out",
    backgroundColor: 'transparent',
    boxShadow: "0 0 10px #949494",
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
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const opciones: BuscarOpcionesInterface[] = [

  {
    codigo: 'numero',
    valor: 'Numero',
    type: 'number'
  },
  {
    codigo: 'fecha',
    valor: 'Fecha',
    type: 'date'
  },
  // {
  //   codigo: 'fav',
  //   valor: 'Favoritos'
  // },
]


interface NotasDatos{
  serie:string,
  numero:string,
  Notas:string[]
}

const Guias = () => {

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const theme = useTheme()

  const colorStyles = theme.palette['primary'];

  const customTableHeader: SxProps<Theme> = {
    backgroundColor: colorStyles.dark,
  }

  const { user } = useAuth({ middleware: '', url: '' })

  const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS
  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const { getError, getSuccess, getWarning } = useNotification()
  const { getToken, getSunatParams } = useAuthToken()

  const [notasCDR, setNotasCDR] = useState<NotasDatos>(null);
  

  const [inputQueryTemp, setInputQueryTemp] = useState<string>(''); // Valores temporales
  const [searchFieldTemp, setSearchFieldTemp] = useState<string>('');

  const [series, setSeries] = useState<string[]>([])

  const [serie, setSerie] = useState<string>('')


  const ObtenerSeries = async () => {
    const { data, status } = await clienteAxios('/api/numeracion/userid', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // console.log(data);
    if (status === 200) {
      console.log(data);

      const newData = data.map(it => it.serie);
      setSeries(newData)
    }
  }

  const [inputQuery, setInputQuery] = useState<string>('')

  const [searchField, setSearchField] = useState<string>('')


  const [ticket, setTicket] = useState<string>('')
  // const [procesoCompleto, setProcesoCompleto] = useState<boolean>(true)

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openAnula, setOpenAnula] = useState(false)

  const [loading, setLoading] = useState<boolean>(false)
  // const handleOpenModalForm = (form: React.ReactNode, title: string) => {
  //   setModalsForms({ open: true, form, title });
  // };

  const qrRef = useRef<HTMLDivElement | null>(null);

  const [hashQr, setHashQr] = useState<string>("");

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  // const handleConfirm = (): void => {
  //   handleCloseModalForm();
  // };

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [params, setParams] = useState<ParamsInterface>(null)



  const [base64Pdf, setBase64Pdf] = useState<string>('')

  const [openPdf, setOpenPdf] = useState(false);
  const handleOpenPdf = () => setOpenPdf(true);
  const handleClosePdf = () => setOpenPdf(false);

  const [guiaSelected, setGuiaSelected] = useState<panelguia>(null)

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const [edit, setEdit] = useState<boolean>(false);

  const handleSearchParams = (field: string, query: string) => {
    setSearchFieldTemp(field);  // Guarda en los estados temporales
    setInputQueryTemp(query);
  };

  // Ejecutar búsqueda al presionar "Buscar"
  const handleSearch = () => {
    setSearchField(searchFieldTemp); // Actualiza los estados definitivos
    setInputQuery(inputQueryTemp);
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSerie(evt.target.value)
  }


  const token = localStorage.getItem("AUTH_TOKEN");

  const url = `${user?.perfil !== 'admin' ? '/' + user?.id : ''}`;

  // const fetcher = () =>
  //   clienteAxios(`/api/estadoelectronico${url}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  // });

  const fetcher = () => {
    let url1 = `/api/estadoelectronico${url}`;

    if (serie && inputQuery === '' && searchField === '') {
      url1 += `/buscar?serie=${serie}`
    }
    if (searchField && inputQuery && serie === '') {
      url1 += `/buscar?${searchField}=${inputQuery}`; // Agrega los parámetros si existen
    }
    else if (searchField && inputQuery && serie) {
      url1 += `/buscar?serie=${serie}&${searchField}=${inputQuery}`; // Agrega los parámetros si existen
    }
    // console.log(url1);
    return clienteAxios(url1, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }


  const { data, isLoading } = useSWR(["/api/estadoelectronico", inputQuery, searchField, serie], fetcher);

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  const sendApi = async (param: any, api: string,) => {
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

  const StyledListItem = styled(ListItem)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    // textAlign: 'center'
  }));


  interface panel  {
    fil:panelguia
  }
  const CustomToolTip = ({fil}:panel) => {
    
    if (!notasCDR) return <></>
    if (notasCDR.Notas.length === 0) return <></>
    if ( fil.serie === notasCDR.serie && fil.numero===notasCDR.numero ){
      return (
        <Box>
          <Box textAlign={'center'}>
            <Typography textAlign={'center'} variant="h6">
              Obs. de {fil.serie}-{fil.numero}
            </Typography>
            {notasCDR.Notas.map((nota, index) => (
              <StyledListItem key={index}>
                <Box key={index} display="flex" justifyContent="space-between" width='100%' alignItems={'center'}>
                  <Typography sx={{fontSize:12}} >{nota}</Typography>
                </Box>
              </StyledListItem>
            ))}
          </Box>
        </Box>
      )
    }else{
      return <></>
    }
    }

  const previewPDF = (values: any) => {


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

    const responsePdf = sendApi({ doc }, "/GeneraPdfDespatch");

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

        handleOpenPdf()
      }
    });
  }

  const ReenviarCorregido = async (values: any) => {

    console.log(values)

    const token_sunat = await getToken()

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

    setLoading(true)
    procesoElectronico(doc, values.electronico.id, token_sunat)
    // const responsePdf = sendApi({ doc }, "/GeneraPdfDespatch");

    // responsePdf.then(pdf => {
    //   setBase64Pdf(pdf.response.TramaPdf)
    //   if (isMobile) {
    //     const link = document.createElement('a');
    //     link.href = `data:application/pdf; base64,${pdf.response.TramaPdf}`;
    //     // document.body.appendChild(link);
    //     link.download = `${doc.serie}-${doc.correlativo}.pdf`
    //     link.click();
    //     // document.body.removeChild(link);
    //   } else {

    //     handleOpenPdf()
    //   }
    // });
  }


  const HandleDowloadFile = async (file: string) => {
    const fileUrl = `${API_GUIAS}${file}`;
    if (fileUrl) {
      // const response = await fetch(fileUrl, { method: 'HEAD' });
      // if (!response.ok) {
      //   getError('Archivo no existe, consulte con el ADMINISTRADOR');
      //   return;
      // }
      const partUrl = fileUrl.split('/');
      // console.log(partUrl)
      if (partUrl.length > 1) {
        const fileName = partUrl[partUrl.length - 1];
        // console.log(fileName)
        if (fileName.includes('.')) {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.setAttribute('download', fileName);
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        else {
          getError('Archivo no existe, consulte con el ADMINISTRADOR');
        }
      } else {
        getError('Archivo no existe, consulte con el ADMINISTRADOR');

      }
    } else {
      getError('Archivo no existe, consulte con el ADMINISTRADOR');
    }

  }

  const handleConsultarNotas = async (fila: panelguia) => {

    const url = `${API_GUIAS}/ConsultaGuia/notas/${fila.serie}-${fila.numero}`;
    const resp = await fetch(url);

    const json = await resp.json()

    if (json.Notas) {
      setNotasCDR({serie:fila.serie,numero:fila.numero,Notas:json.Notas})
    } else {
      setNotasCDR(null)
    }
  }

  const HandleDowloadFilePdf = async (file: string) => {
    const fileUrl = `${API_GUIAS}${file}`;
    if (fileUrl) {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      // console.log(response)
      if (!response.ok) {
        getError('Archivo no existe, consulte con el ADMINISTRADOR1');
        return;
      }
      const partUrl = fileUrl.split('/');
      // console.log(partUrl)
      if (partUrl.length > 1) {
        const fileName = partUrl[partUrl.length - 1];
        // console.log(fileName)
        if (fileName.includes('.')) {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.setAttribute('download', fileName);
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        else {
          getError('Archivo no existe, consulte con el ADMINISTRADOR');
        }
      } else {
        getError('Archivo no existe, consulte con el ADMINISTRADOR');

      }
    } else {
      getError('Archivo no existe, consulte con el ADMINISTRADOR');
    }

  }

  const procesoElectronico = async (doc, estadoElectronico, token_sunat) => {
    if (!params) {
      setLoading(false)
      return;
    }
    const numeroDocumento = `${params.ruc}-${doc.tipoDoc}-${doc.serie}-${doc.correlativo}`;
    try {
      const xmlRes = await sendApi({ doc }, "/GeneraXmlDespatch");
      if (!params.certificado) {
        getError('NO HAY UN TOKEN GENERADO');
        setLoading(false)
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

        const signRes = await sendApi(sign, '/FirmarXml');
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

          const sendRes = await sendApi(sendReq, '/SendDespatch');
          if (sendRes.exito) {
            // setConsultToken(token_sunat);
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

            const consultRes = await sendApi(consultReq, '/ConsultaGuia');
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
              // setProcesoCompleto(false)
              setLoading(false)
              return;
            }

            const descripcion = consultRes.CdrResponse?.Descripcion || 'PENDIENTE DE CONSULTA';
            // const estadoSunat = consultRes.codRespuesta || '';

            await updateEstadoElectronico({
              estado: descripcion === 'PENDIENTE DE CONSULTA' ? 'P' : 'F',
              rutaCdr: `/CDR/${numeroDocumento}.zip`,
              rutaPdf: `/PDF/${numeroDocumento}.pdf`,
              cdrbase64: consultRes.arcCdr || '',
              hashQr: consultRes.CdrResponse?.hashQr || '',
              descripcion,
              'estadoSunat': consultRes.codRespuesta ? consultRes.codRespuesta : '',
              'codigoSunat': consultRes.codRespuesta ? consultRes.codRespuesta : '',
            }, estadoElectronico);

            // setProcesoCompleto(false)

            // setHashQr(consultRes.CdrResponse?.hashQr);
            getSuccess(descripcion);
            setLoading(false)

            // if (consultRes.codRespuesta === "0") {
            //   // setAceptada(true)

            //   const rutaPDF = `${API_GUIAS}/PDF/${numeroDocumento}.pdf`;
            //   // setPdfUrl(rutaPDF)

            //   // HandlePdfCompany(despacho);

            //   // setRefresh(true);
            // }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const HandleReDowloadFilePdf = async (doc: panelguia) => {
    const fileUrl = `${API_GUIAS}${doc.rutaPdf}`;
    if (fileUrl) {

      setLoading(true)

      const responsePdf = sendApi({ url: doc.hashQr, numero: doc.serie + '-' + doc.numero }, "/ConsultaGuia/redownload");


      responsePdf.then(pdf => {


        if (pdf.status === 'success') {


          if (pdf.base64 === undefined) {
            getError('Hubo un error al consultar el archivo')
            setLoading(false)
            return;
          }
          getSuccess('Descarga exitosa');
          setBase64Pdf(pdf.base64)

          if (isMobile) {
            const link = document.createElement('a');
            link.href = `data:application/pdf; base64,${pdf.response.TramaPdf}`;
            // document.body.appendChild(link);
            link.download = `${doc.serie}-${doc.numero}.pdf`
            link.click();
            // document.body.removeChild(link);
          } else {

            handleOpenPdf()
          }
        } else {
          getError('TIempo de consulta excedido, vuelva a intentarlo')
        }
        setLoading(false)

      });
      // const response = await fetch(fileUrl, { method: 'HEAD' });
      // console.log(response)
      // if (!response.ok) {
      //   getError('Archivo no existe, consulte con el ADMINISTRADOR1');
      //   return;
      // }
      // const partUrl = fileUrl.split('/');
      // // console.log(partUrl)
      // if (partUrl.length > 1) {
      //   const fileName = partUrl[partUrl.length - 1];
      //   // console.log(fileName)
      //   if (fileName.includes('.')) {
      //     const link = document.createElement('a');
      //     link.href = fileUrl;
      //     link.setAttribute('download', fileName);
      //     link.target = "_blank";
      //     document.body.appendChild(link);
      //     link.click();
      //     document.body.removeChild(link);
      //   }
      //   else {
      //     getError('Archivo no existe, consulte con el ADMINISTRADOR');
      //   }
      // } else {
      //   getError('Archivo no existe, consulte con el ADMINISTRADOR');

      // }
    } else {
      getError('Archivo no existe, consulte con el ADMINISTRADOR');
    }

  }
  const getParams = async () => {
    const data = await getSunatParams();
    setParams(data)
  }
  useEffect(() => {
    getParams()
    ObtenerSeries()
  }, [])

  const HandleConsult = async (fil: panelguia) => {

    if (fil.estado === "F") {
      getSuccess('El Comprobante ya tiene respuesta, no puede volver a consultar');
      return;
    }

    if (fil.ticket === "") {
      getError('El comprobante no tiene TICKET, consulte al administrador');
      return;
    }
    const numeroDocumento = `${params.ruc}-09-${fil.serie}-${fil.numero}`;
    const urlconsult = params.urlconsult;

    const token_sunat = await getToken()
    if (token_sunat) {
      const consult = {
        "access_token": token_sunat,
        "EndPointUrl": `${urlconsult}${fil.ticket}`,
        numeroDocumento
      }

      sendApi(consult, '/ConsultaGuia')
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
            }, fil.id);
            return;
          }

          if (!resConsult.CdrResponse) {
            updateEstadoElectronico({
              'estado': 'C',
              // 'descripcion':'Documento consultado con Exito',
              'rutaCdr': `/CDR/`,
              'rutaPdf': `/PDF/`,
              'descripcion': resConsult.codRespuesta ? resConsult.error.desError : 'PENDIENTE DE CONSULTA',
              'estadoSunat': resConsult.codRespuesta ? resConsult.codRespuesta : ''
            }, fil.id);
            getWarning('Si ha generado el token y el ticket de consulta, Consulte otra vez');
            return;
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
          }, fil.id);
          // setHashQr(resConsult.CdrResponse.hashQr)
          getSuccess(resConsult.CdrResponse.Descripcion);

          // if(resConsult.codRespuesta==="0"){
          //   setRefresh(true)
          // }
          // console.log(resConsult)
        });

    }

  }

  const handlePickGuia = (fil: panelguia) => {
    setGuiaSelected(fil)
    setOpenAnula(true)
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

  const HandlePdfCompany = (id: number) => {
    clienteAxios(`/api/despatches/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      const { status, data } = response;
      if (status || status === 200) {
        previewPDF(data?.data);
      }
    })
  }

  const HandleRegenerar = (id: number) => {
    clienteAxios(`/api/despatches/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      const { status, data } = response;
      if (status || status === 200) {
        ReenviarCorregido(data?.data);
      }
    })
  }
  const TableCellStyles = {
    // padding: '8px',
    fontSize: !isMobile ? '0.875rem' : '0.60rem', // Adjust font size here

  }

  data?.data?.data.forEach((fil: panelguia) => {
    rows.push(
      <TableRow key={fil.id}>
        {!isMobile && <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.id}</TableCell>}
        <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.serie}</TableCell>
        <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.numero}</TableCell>
        <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.fecha}</TableCell>
        {!isMobile && <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.codigoSunat}</TableCell>}
        <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.descripcion}</TableCell>
        {!isMobile && <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">{fil.estado}</TableCell>}
        {!isMobile && <TableCell sx={{
          ...TableCellStyles, maxWidth: 120, // Ajusta el ancho máximo según sea necesario
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}`
        }} align="left">{fil.name}</TableCell>}

        <TableCell sx={{ ...TableCellStyles, color: `${fil.estado === 'B' ? theme.palette.error.main : 'inherit'}` }} align="left">
          <Fab
            size="small"
            onClick={() => HandlePdfCompany(fil.id_despatch)}
            sx={{ ...BoxShadowButton }}
          >
            <VisibilityIcon color="error" fontSize="small" />
          </Fab>
        </TableCell>
        {!isMobile && <TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandleDowloadFile(fil.rutaXml)}
            sx={{ ...BoxShadowButton }}
          >
            <AttachFileIcon color="primary" />
          </Fab>
        </TableCell>}
        <TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandleDowloadFilePdf(fil.rutaPdf)}
            sx={{ ...BoxShadowButton }}
          >
            <PictureAsPdfIcon color="error" />
          </Fab>
        </TableCell>
        {!isMobile && <TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandleDowloadFile(fil.rutaCdr)}
            sx={{ ...BoxShadowButton }}
          >
            <FolderSpecialIcon color="success" />
          </Fab>

        </TableCell>}
        {/* FormatListBulletedIcon */}

        {!isMobile && <TableCell sx={TableCellStyles} align="left">
          <Tooltip title={<CustomToolTip  fil={fil}  />}>
            <Fab
              size="small"
              onClick={() => handleConsultarNotas(fil)}
              sx={{ ...BoxShadowButton }}
            >
              <FormatListBulletedIcon color="success" />
            </Fab>
          </Tooltip>

        </TableCell>}

        <TableCell sx={TableCellStyles} align="left">
          <Fab
            color="secondary"
            size="small"
            onClick={() => handleUrlHashQr(fil.hashQr)}
          >
            <LinkIcon />
          </Fab>
        </TableCell>
        <TableCell sx={TableCellStyles} align="left">
          <Fab
            color="default"
            size="small"
            onClick={() => handleImageQr(fil.hashQr)}
          >
            <QrCodeIcon />
          </Fab>
        </TableCell>

        <TableCell sx={TableCellStyles} align="left">
          <Box display={"flex"} flexDirection={"row"} columnGap={1}>
            {/* <Link to={`/guiaedicion/${fil.id_despatch}`}>
              <Fab
                color="primary"
                size="small"
                // onClick={() => handleEditGuia(fil)}
              >
                <EditIcon />
              </Fab>
            </Link> */}
            <Tooltip title={'Consultar ticket'}>

              <Fab color="warning" size="small" onClick={() => HandleConsult(fil)} disabled={fil.estado === 'B'}>
                <FindInPageIcon />
              </Fab>
            </Tooltip>

            <Tooltip title={'Re Generar PDF SUNAT'}>
              <Fab color="info" size="small" onClick={() => HandleReDowloadFilePdf(fil)}>
                <RefreshIcon />
              </Fab>
            </Tooltip>

            {
              user.perfil === 'admin' &&
              <Tooltip title={'Reenviar Guia corregida'}>
                <Fab color="info" size="small" onClick={() => HandleRegenerar(fil.id_despatch)} disabled={fil.estado === 'B'}>
                  <ReplyAllIcon />
                </Fab>
              </Tooltip>
            }
            {
              user.perfil !== 'operador' &&
              <Tooltip title={'Baja Local de Guía'}>
                <Fab color="error" size="small" onClick={() => handlePickGuia(fil)} disabled={fil.estado === 'B'}>
                  <DoDisturbIcon />
                </Fab>
              </Tooltip>
            }

          </Box>
        </TableCell>
      </TableRow>
    );
  });

  // const handleEditGuia = (guia: panelguia) => {
  //   // setEdit(false);
  //   // const selectedPunto = data.data.data.find(item => item.id === id);
  //   // handleOpenModalForm(
  //   //   <ModalConductor initialValue={conductor} edit={true} onConfirm={handleConfirm} />,
  //   //   'Editar conductor'
  //   // )
  // };

  const handleAnular = async () => {

    if (guiaSelected) {

      try {
        const { data, status } = await clienteAxios.put(`/api/despatches/baja/${guiaSelected.id_despatch}`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        // console.log(data)
        if (status === 200) {
          getSuccess(data.message)
        }
      }
      catch (error) {
        console.log(error)
      }

      setOpenAnula(false)
    }
  }


  const handleImageQr = (qr: any) => {
    if (qr) {
      setHashQr(qr);
      handleOpen();
    }
  };

  const handleUrlHashQr = (qr: any) => {
    window.open(qr, "_blank");
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'codigo_qr.png';
        link.click();
      }
    }
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display="flex" flexDirection={{ sm: 'row', xs: 'column' }} textAlign={{ sm: 'left', xs: 'center' }} component="div" justifyContent="space-between">
        <Typography>Estado de las Guías Electrónicas</Typography>
        {ticket.length > 0 &&
          <Box display={'flex'} flexDirection={{ sm: 'row', xs: 'column' }} columnGap={1} justifyContent={'space-between'}>
            <TextField
              label='Ticket'
              fullWidth
              value={ticket}
              size="small"
            />
            <Button
              color="success"
              // onClick={() => {
              //   handleOpenModalForm(
              //     <ModalConductor
              //       initialValue={null}
              //       edit={false}
              //       onConfirm={handleCloseModalForm}
              //     />,
              //     "Nuevo conductor"
              //   );
              // }}
              size="small"
              fullWidth
              variant="outlined"
            >
              Consultar
            </Button>
          </Box>
        }
      </Box>
      <Box display={"flex"}>
        <FormControl sx={{ width: '50%' }} margin='normal' size='small'>
          <InputLabel id="demo-simple-select-label">Series</InputLabel>
          <Select
            name='series'
            // value={searchField}
            value={serie}
            label="Series"
            onChange={handleChange}
          >
            {series.map(ser => (
              <MenuItem key={ser} value={ser}>{ser}</MenuItem>
            ))}
            <MenuItem value="">Elija su Serie</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} mb={1}>
        <BuscarComponent opciones={opciones} onSearchChange={handleSearchParams} />
      </Box>

      <Button onClick={handleSearch} size='small' fullWidth color='success' variant='contained' sx={{ mb: 1 }}>Buscar</Button>


      <TableContainer component={Paper}>
        <Table aria-label="simple table" size="small">
          <TableHead sx={customTableHeader} >
            <TableRow>
              {!isMobile && <TableCell width={"1%"}>Id</TableCell>}
              <TableCell width={"5%"} align="left">
                Serie
              </TableCell>
              <TableCell width={"5%"} align="left">
                Num
              </TableCell>
              <TableCell width={"13%"} align="left">
                Fecha
              </TableCell>
              {!isMobile && <TableCell width={"5%"} align="left">
                C.Sunat
              </TableCell>}
              <TableCell width={"30%"} align="left">
                Descripcion
              </TableCell>
              <TableCell width={"10%"} align="left">
                Est
              </TableCell>
              {!isMobile && <TableCell width={"5%"} align="left">
                Usuario
              </TableCell>}
              <TableCell width={"5%"} align="center">
                PDF
              </TableCell>

              {!isMobile && <TableCell width={"5%"} align="center">
                XML
              </TableCell>}
              <TableCell width={"5%"} align="center">
                PDFS
              </TableCell>
              {!isMobile && <TableCell width={"5%"} align="center">
                CDR
              </TableCell>}
              {!isMobile && <TableCell width={"5%"} align="center">
                NOTAS
              </TableCell>}

              <TableCell width={"5%"} align="center">
                Url
              </TableCell>
              <TableCell width={"5%"} align="center">
                QR
              </TableCell>
              <TableCell width={"10%"} align="center">
                @
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow style={{ height: 53 * rowsPerPage }}>
                <TableCell colSpan={11} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            ) : (
              <TableRow style={{ height: 53 * rowsPerPage }}>
                <TableCell colSpan={11} align="center">
                  <h2>No hay resultados</h2>
                </TableCell>
              </TableRow>
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={11} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* <ProductoFormModal/> */}
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
          <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
            Imagen QR
          </Typography>
          <Box
            display={"flex"}
            textAlign={"center"}
            justifyContent={'center'}
            ref={qrRef}
          >
            <QRCode value={hashQr} size={256} />
          </Box>
          <Button onClick={downloadQRCode} sx={{ mt: 2 }} fullWidth variant="contained" color="success">

            Descargar QR

          </Button>
        </Box>
      </Modal>
      <Modal
        open={openPdf}
        onClose={handleClosePdf}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={stylePdf}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Visor de Pdf
          </Typography>
          <Box sx={{ width: '100%', height: '70vh' }} component={'embed'} src={`data:application/pdf;base64,${base64Pdf}`} />
        </Box>
      </Modal>
      <Dialog
        open={openAnula}
      >
        <DialogTitle>Anulación de Guía</DialogTitle>
        <DialogContent sx={{ maxWidth: 350 }}>
          <DialogContentText variant='body2' textAlign={'center'}>¿Desea anular el comprobante {guiaSelected?.serie}-{guiaSelected?.numero}?</DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button size='small' variant='contained' color='success' onClick={handleAnular} >Aceptar</Button>
          <Button size='small' variant='contained' color='error' onClick={() => setOpenAnula(false)} >Cancelar</Button>
        </DialogActions>

      </Dialog>

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
        onClick={() => setLoading(false)}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container >
  );
};

export default Guias;

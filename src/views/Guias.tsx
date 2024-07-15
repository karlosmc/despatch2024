
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Fab,

  Modal,
  Paper,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
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


import FindInPageIcon from "@mui/icons-material/FindInPage";
import { DialogComponentCustom } from "../components";

import QRCode from "qrcode.react";

import ModalConductor from "../components/Conductor";
import { panelguia } from "../types/panelguia.interface";

import { useNotification } from "../context/notification.context";
import { ParamsInterface } from "../types/params.interface";
import useAuthToken from "../hooks/useAuthToken";
import { useAuth } from "../hooks/useAuth";
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

const Guias = () => {

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const theme = useTheme()

  const colorStyles = theme.palette['primary'];

  const customTableHeader: SxProps<Theme> = {
    backgroundColor: colorStyles.dark,
  }

  const {user} = useAuth({middleware:'',url:''})
  
  const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS
  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const { getError, getSuccess,getWarning } = useNotification()
  const { getToken, getSunatParams } = useAuthToken()

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

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

  const token = localStorage.getItem("AUTH_TOKEN");
  const fetcher = () =>
    clienteAxios(`/api/estadoelectronico/${user?.perfil==='operador'?user?.id:''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  const { data, isLoading } = useSWR("/api/estadoelectronico", fetcher);

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


  const getParams = async () => {
    const data = await getSunatParams();
    setParams(data)
  }


  useEffect(() => {
    getParams()
  }, [])

  const HandleConsult = async (fil:panelguia) => {

    if(fil.estado==="0"){
      getSuccess('El Comprobante ya tiene respuesta, no puede volver a consultar');
      return;
    }

    if(fil.ticket===""){
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
              'descripcion': 'PENDIENTE DE CONSULTA',
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
  const TableCellStyles = {
    // padding: '8px',
    fontSize: !isMobile?'0.875rem':'0.60rem', // Adjust font size here

  }

  data?.data?.data.forEach((fil: panelguia) => {
    rows.push(
      <TableRow key={fil.id}>
        {!isMobile&&<TableCell sx={TableCellStyles} align="left">{fil.id}</TableCell>}
        <TableCell sx={TableCellStyles} align="left">{fil.serie}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.numero}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.fecha}</TableCell>
        {!isMobile&&<TableCell sx={TableCellStyles} align="left">{fil.codigoSunat}</TableCell>}
        <TableCell sx={TableCellStyles} align="left">{fil.descripcion}</TableCell>
        {!isMobile&&<TableCell sx={TableCellStyles} align="left">{fil.estado}</TableCell>}
        <TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandlePdfCompany(fil.id_despatch)}
            sx={{ ...BoxShadowButton }}
          >
            <VisibilityIcon color="error" fontSize="small" />
          </Fab>
        </TableCell>
        {!isMobile&&<TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandleDowloadFile(fil.rutaXml)}
            sx={{ ...BoxShadowButton }}
          >
            <AttachFileIcon color="primary" />
          </Fab>
        </TableCell>}
        {!isMobile&&<TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandleDowloadFile(fil.rutaPdf)}
            sx={{ ...BoxShadowButton }}
          >
            <PictureAsPdfIcon color="error" />
          </Fab>
        </TableCell>}
        {!isMobile&&<TableCell sx={TableCellStyles} align="left">
          <Fab
            size="small"
            onClick={() => HandleDowloadFile(fil.rutaCdr)}
            sx={{ ...BoxShadowButton }}
          >
            <FolderSpecialIcon color="success" />
          </Fab>

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
          <Box display={"flex"} flexDirection={"row"}>
            {/* <Link to={`/guiaedicion/${fil.id_despatch}`}>
              <Fab
                color="primary"
                size="small"
                // onClick={() => handleEditGuia(fil)}
              >
                <EditIcon />
              </Fab>
            </Link> */}
            <Fab color="warning" size="small" onClick={()=>HandleConsult(fil)}>
              <FindInPageIcon />
            </Fab>
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
      <Box my={3} display="flex" flexDirection={{sm:'row',xs:'column'}} textAlign={{sm:'left',xs:'center'}} component="div" justifyContent="space-between">
        <Typography>Estado de las Guías Electrónicas</Typography>
        <Button
          color="primary"
          onClick={() => {
            handleOpenModalForm(
              <ModalConductor
                initialValue={null}
                edit={false}
                onConfirm={handleCloseModalForm}
              />,
              "Nuevo conductor"
            );
          }}
          variant="outlined"
        >
          Agregar Conductor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="simple table" size="small">
          <TableHead sx={customTableHeader}>
            <TableRow>
              {!isMobile&& <TableCell width={"1%"}>Id</TableCell>}
              <TableCell width={"5%"} align="left">
                Serie
              </TableCell>
              <TableCell width={"5%"} align="left">
                Num
              </TableCell>
              <TableCell width={"13%"} align="left">
                Fecha
              </TableCell>
              {!isMobile&&<TableCell width={"5%"} align="left">
                C.Sunat
              </TableCell>}
              <TableCell width={"30%"} align="left">
                Descripcion
              </TableCell>
              {!isMobile&&<TableCell width={"10%"} align="left">
                Est
              </TableCell>}
              <TableCell width={"5%"} align="center">
                PDF
              </TableCell>

              {!isMobile&&<TableCell width={"5%"} align="center">
                XML
              </TableCell>}
              {!isMobile&&<TableCell width={"5%"} align="center">
                PDFS
              </TableCell>}
              {!isMobile&&<TableCell width={"5%"} align="center">
                CDR
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
    </Container>
  );
};

export default Guias;

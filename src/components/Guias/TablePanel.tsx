import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, TablePagination, useTheme, Theme, SxProps, useMediaQuery, Box,  Tooltip, ListItem, styled, Typography, Modal, Button, Backdrop, IconButton, Menu, MenuItem, ListItemIcon, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { panelguia } from '../../types/panelguia.interface';

import LinkIcon from "@mui/icons-material/Link";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import MoreVertIcon from '@mui/icons-material/MoreVert';

import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/notification.context';

import { useAuthStore } from '../../store/authStore';
import PreviewPdf from './PreviewPdf';
import { GuiaServices } from '../../service/GuiaServices';
import QRCode from 'qrcode.react';
import { ProcesarGuiaModal } from '../../pages/GuiaRemision/ProcesarGuia';
import { useGuiaElectronica } from '../../hooks/useGuiaElectronica';
import { useTokenParamsStore } from '../../store/tokenParamsStore';
import { GuiaElectronicaService } from '../../service/GuiaElectronicaService';
import { PictureAsPdfSharp } from '@mui/icons-material';


interface TablePanelProps {
  isLoading: boolean;
  guias: panelguia[];
  reFetch: () => void;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  totalCount: number;
  setRowsPerPage: (rowsPerPage: number) => void;
}
interface NotasDatos {
  serie: string,
  numero: string,
  Notas: string[]
}

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


const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS


interface panel {
  fil: panelguia
}

const TablePanel = ({
  isLoading,
  guias,
  reFetch,
  page,
  setPage,
  rowsPerPage,
  totalCount,
  setRowsPerPage
}: TablePanelProps) => {


  const theme = useTheme();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const params = useTokenParamsStore(state => state.params);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { getError, getSuccess } = useNotification()

  const { reintentarConsulta } = useGuiaElectronica();

  const [notasCDR, setNotasCDR] = useState<NotasDatos>(null);

  const [hashQr, setHashQr] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [datosParaProcesar, setDatosParaProcesar] = useState(null)
  const [isConsulting, setIsConsulting] = useState(false)
  const [isPdfDownloading, setIsPdfDownloading] = useState(false)
  const [open, setOpen] = useState(false);

  const [openPdf, setOpenPdf] = useState(false)

  const [guiaSelected, setGuiaSelected] = useState<number>(null);

  const [guiaSeleccionadaAnula, setGuiaSeleccionadaAnula] = useState<panelguia>(null)

  const [guiaSeleccionada, setGuiaSeleccionada] = useState<panelguia>(null)

  const [selectedRowForMenu, setSelectedRowForMenu] = useState<panelguia>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [openAnulacion, setopenAnulacion] = useState(false)

  const openMenu = Boolean(anchorEl);

  const qrRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalClose = (): void => {
    setModalOpen(false);
  };

  const handleProcesoSuccess = (_resultado: any): void => {
    console.log('Proceso completado exitosamente');
    getSuccess('Guia enviada correctamente a SUNAT');
    setTimeout(() => {
      reFetch();
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

  const colorStyles = theme.palette['primary'];

  const customTableHeader: SxProps<Theme> = {
    backgroundColor: colorStyles.dark,
  }
  const TableCellStyles = {
    // padding: '8px',
    fontSize: !isMobile ? '0.875rem' : '0.60rem', // Adjust font size here
  }

  const AnimatedIconButtonStyles = {
    p: 0.5,
    borderRadius: '50%',
    transition: 'all 0.2s ease-in-out',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 2px 4px rgba(0,0,0,0.4)' 
      : '0 2px 4px rgba(0,0,0,0.15)',
    '&:hover': {
      transform: 'scale(1.15)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 4px 12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
        : '0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
      '& .MuiSvgIcon-root': {
        filter: 'brightness(1.1)',
      }
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
    '&:disabled': {
      opacity: 0.4,
      boxShadow: 'none',
      transform: 'none',
    }
  }
  const StyledListItem = styled(ListItem)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    // textAlign: 'center'
  }));

  const CustomToolTip = ({ fil }: panel) => {

    if (!notasCDR) return <></>
    if (notasCDR.Notas.length === 0) return <></>
    if (fil.serie === notasCDR.serie && fil.numero === notasCDR.numero) {
      return (
        <Box>
          <Box textAlign={'center'}>
            <Typography textAlign={'center'} variant="h6">
              Obs. de {fil.serie}-{fil.numero}
            </Typography>
            {notasCDR.Notas.map((nota, index) => (
              <StyledListItem key={index}>
                <Box key={index} display="flex" justifyContent="space-between" width='100%' alignItems={'center'}>
                  <Typography sx={{ fontSize: 12 }} >{nota}</Typography>
                </Box>
              </StyledListItem>
            ))}
          </Box>
        </Box>
      )
    } else {
      return <></>
    }
  }

  const HandleDowloadFile = async (file: string) => {
    const fileUrl = `${API_GUIAS}${file}`;
    if (fileUrl) {

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

    console.log(fila);
    try {
      setNotasCDR(null);

      const response = await GuiaServices.consultarNotas(fila.serie, fila.numero);
      console.log(response);
      if (response.Notas) {
        setNotasCDR({ serie: fila.serie, numero: fila.numero, Notas: response.Notas })
      } else {
        setNotasCDR(null)
      }

    } catch (error) {
      console.log(error);
      setNotasCDR(null)
    }

  }

  const HandleDowloadFilePdf = async (file: string) => {
    const fileUrl = `${API_GUIAS}${file}`;
    if (fileUrl) {
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

  const handleUrlHashQr = (qr: any) => {
    window.open(qr, "_blank");
  };

  const handleImageQr = (qr: any) => {
    if (qr) {
      setHashQr(qr);
      handleOpen();
    }
  };


  const HandleRegenerar = async (fila: panelguia) => {

    try {

      if (fila.estado === "F") {
        getSuccess('El Comprobante ya tiene respuesta, no puede volver a consultar');
        return;
      }
      const { data: guia } = await GuiaServices.get(fila.id_despatch);
      setGuiaSeleccionada(fila);
      let vehiculos = guia.envio.vehiculo?.length > 0 ? guia.envio.vehiculo?.find(ve => ve.tipo === 'P') : null;
      let secundarios = guia.envio.vehiculo?.length > 0 ? guia.envio.vehiculo?.filter(ve => ve.tipo === 'S') : [];


      if (vehiculos) {
        // console.log(values.envio.vehiculo)
        // let secundarios = values.envio.vehiculo.filter(ve => ve.tipo === 'S') && [];
        // console.log(secundarios)
        vehiculos.secundarios = secundarios;
      }

      const doc = {
        ...guia,
        tipoDoc: '09',
        envio: {
          ...guia.envio,
          indicadores: guia.envio.indicadores.map(indi => indi.indicador),
          vehiculo: vehiculos
        }
      }

      setDatosParaProcesar(doc);
      setModalOpen(true);


    } catch (error) {
      console.log(error);
      getError('Error al obtener la guia');


    }

  }

  const HandleConsult = async (fil: panelguia) => {

    if (fil.estado === "F") {
      getSuccess('El Comprobante ya tiene respuesta, no puede volver a consultar');
      return;
    }
    if (fil.ticket === "") {
      getError('El comprobante no tiene TICKET, consulte al administrador');
      return;
    }

    try {
      setIsConsulting(true);
      const numeroDocumento = `${params.ruc}-09-${fil.serie}-${fil.numero}`;
      const result = await reintentarConsulta(
        numeroDocumento,
        fil.ticket,
        fil.id
      );

      // Manejar la nueva estructura de respuesta
      if (result.success && result.completado) {
        getSuccess(result.datos?.descripcion || 'Consulta completada exitosamente');
        // Opcional: recargar datos o actualizar tabla
        // setTimeout(() => {
        //   window.location.reload();
        // }, 3000);
      } else if (!result.completado && result.datos?.puedeReintentar) {
        // Caso donde hay error pero se puede reintentar
        getError(`${result.datos?.descripcion || 'Error en consulta'} - Puede intentar nuevamente`);
      } else {
        getError('No se pudo completar la consulta, intente nuevamente');
      }
    } catch (error: any) {
      getError(error?.message || 'Error al consultar el comprobante');
    }
    finally {
      setIsConsulting(false);
      setTimeout(() => {
        reFetch();
      }, 3000);
    }
  }

  const handleForceCloseConsulting = () => {
    setIsConsulting(false);
  };

  const handleForceClosePdfDownload = () => {
    setIsPdfDownloading(false);
  };

  const HandleReDowloadFilePdf = async (fil: panelguia) => {
    try {
      setIsPdfDownloading(true);
      const response = await GuiaElectronicaService.tryDownloadAgain(fil.hashQr, `${fil.serie}-${fil.numero}`);
      if (response.status === 'success') {
        HandleDowloadFilePdf(fil.rutaPdf)
        getSuccess('PDF descargado exitosamente');
      } else {
        getError('No se pudo regenerar el PDF');
      }
    } catch (error) {
      console.log(error);
      getError(error || 'Error al intentar descargar el PDF');
    } finally {
      setIsPdfDownloading(false);
    }
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, fila: panelguia) => {
    setSelectedRowForMenu(fila);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRowForMenu(null);
  }

  const handlePickGuiaPdf = (fil: number) => {
    setGuiaSelected(fil)
    setOpenPdf(true)
  }

  const handleClosePdf = useCallback(() => {
    setOpenPdf(false);
    setGuiaSelected(null);
  }, [])


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

  const handleEditGuia = (fila: panelguia) => {
    // Navegar a la ruta de edición con el ID de la guía
    navigate(`/admin/guiaremision/edit/${fila.id_despatch}`);
  };

  const handleEditGuiaNueva = (fila: panelguia) => {
    // Edición en el formulario nuevo (responsive)
    navigate(`/admin/guiaremision/nueva/${fila.id_despatch}`);
  };

  const handleSeleccionarGuiaAnula = (fil: panelguia) => {
    setGuiaSeleccionadaAnula(fil)
    setopenAnulacion(true)
  }

  const handleAnular = async () => {
    
    if (guiaSeleccionadaAnula) {

      try {
        const result = await GuiaServices.baja(guiaSeleccionadaAnula.id_despatch);
        getSuccess(result.message);
        reFetch();
        
      } catch (error: any) {
        getError(error || 'Error al anular la guia');
      }

      setopenAnulacion(false)
    }
  }

  const rows = [];

  guias?.forEach((fil: panelguia) => (
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

        <TableCell sx={TableCellStyles} align="center">
          <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
            <Tooltip title="Consultar ticket en SUNAT" disableHoverListener={fil.ticket === "" || fil.estado === 'B' || fil.estado === 'F'}>
              <span>
                <IconButton
                  size="small"
                  color="success"
                  disabled={fil.ticket === "" || fil.estado === 'B' || fil.estado === 'F'}
                  onClick={() => HandleConsult(fil)}
                  sx={AnimatedIconButtonStyles}
                >
                  <FindInPageIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Regenerar PDF desde SUNAT" disableHoverListener={fil.hashQr === ""}>
              <span>
                <IconButton
                  size="small"
                  color="warning"
                  disabled={fil.hashQr === ""}
                  onClick={() => HandleReDowloadFilePdf(fil)}
                  sx={AnimatedIconButtonStyles}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {user?.perfil === 'admin' && (
              <Tooltip title="Reenviar guía corregida" disableHoverListener={fil.estado === 'B' || fil.estado === 'F'}>
                <span>
                  <IconButton
                    size="small"
                    color="info"
                    disabled={fil.estado === 'B' || fil.estado === 'F'}
                    onClick={() => HandleRegenerar(fil)}
                    sx={AnimatedIconButtonStyles}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {user?.perfil === 'admin' && (
              <Tooltip title="Dar de baja guía" disableHoverListener={fil.estado !== 'F'}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={fil.estado !== 'F'}
                    onClick={() => handleSeleccionarGuiaAnula(fil)}
                    sx={AnimatedIconButtonStyles}
                  >
                    <DoDisturbIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </TableCell>
        <TableCell sx={TableCellStyles} align="center">
          <Tooltip title="Editar guía" disableHoverListener={fil.estado === 'B' || fil.estado === 'F'}>
            <span>
              <IconButton
                size="small"
                color="primary"
                disabled={fil.estado === 'B' || fil.estado === 'F'}
                onClick={() => handleEditGuia(fil)}
                sx={AnimatedIconButtonStyles}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Editar en el formulario nuevo" disableHoverListener={fil.estado === 'B' || fil.estado === 'F'}>
            <span>
              <IconButton
                size="small"
                color="secondary"
                disabled={fil.estado === 'B' || fil.estado === 'F'}
                onClick={() => handleEditGuiaNueva(fil)}
                sx={AnimatedIconButtonStyles}
              >
                <AutoAwesomeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
        <TableCell sx={TableCellStyles} align="center">
          <Box>
            <IconButton
              id='basic-iconbutton'
              onClick={(e) => handleOpenMenu(e, fil)}
              size='small'
              aria-controls={openMenu ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              sx={AnimatedIconButtonStyles}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="basic-menu"
              open={openMenu}
              onClose={handleCloseMenu}
              onClick={handleCloseMenu}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => handlePickGuiaPdf(selectedRowForMenu?.id_despatch)}>
                <ListItemIcon>
                  <VisibilityIcon color='error' fontSize='small' />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.85rem' }} >Ver PDF</Typography>
              </MenuItem>
              <MenuItem onClick={() => HandleDowloadFilePdf(selectedRowForMenu?.rutaPdf)}>
                <ListItemIcon>
                  <PictureAsPdfSharp color='error' fontSize='small' />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.85rem' }} >Descargar PDF SUNAT</Typography>
              </MenuItem>
              <MenuItem onClick={() => HandleDowloadFile(selectedRowForMenu?.rutaXml)}>
                <ListItemIcon>
                  <AttachFileIcon color='primary' fontSize='small' />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.85rem' }} >Descargar XML</Typography>
              </MenuItem>

              <MenuItem onClick={() => HandleDowloadFile(selectedRowForMenu?.rutaCdr)}>
                <ListItemIcon>
                  <FolderSpecialIcon color='success' fontSize='small' />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.85rem' }} >Descargar CDR</Typography>
              </MenuItem>
              <Tooltip title={<CustomToolTip fil={selectedRowForMenu} />} placement="left">
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConsultarNotas(selectedRowForMenu);
                  }}
                  onMouseEnter={(e) => e.stopPropagation()}
                >
                  <ListItemIcon>
                    <FormatListBulletedIcon color='success' fontSize='small' />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.85rem' }} >Ver Notas</Typography>
                </MenuItem>
              </Tooltip>

              <MenuItem onClick={() => handleUrlHashQr(selectedRowForMenu?.hashQr)}>
                <ListItemIcon>
                  <LinkIcon color='success' fontSize='small' />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.85rem' }} >Hash QR</Typography>
              </MenuItem>

              <MenuItem onClick={() => handleImageQr(selectedRowForMenu?.hashQr)}>
                <ListItemIcon>
                  <QrCodeIcon fontSize='small' />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.85rem' }} >Ver QR en imagen</Typography>
              </MenuItem>

            </Menu>
          </Box>
        </TableCell>
      </TableRow>
    )
  ))

  return (
    <>
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
              <TableCell width={"15%"} align="center">
                Acciones
              </TableCell>
              <TableCell width={"15%"} align="center">
                Editar
              </TableCell>
              <TableCell width={"5%"} align="center">
                Más
              </TableCell>

            </TableRow>
          </TableHead>
          <TableBody>

            {
              isLoading ? (<TableRow style={{ height: 53 * rowsPerPage }}><TableCell colSpan={11} align="center"><CircularProgress /></TableCell></TableRow>) :
                rows.length > 0 ? rows
                  :
                  <TableRow style={{ height: 53 * rowsPerPage }}><TableCell colSpan={11} align="center"><h2>No hay resultados</h2></TableCell></TableRow>
            }

          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
      />
      {
        guiaSelected &&
        <PreviewPdf openPdf={openPdf} idGuia={guiaSelected} handleClosePdf={handleClosePdf} />
      }

      {/*  Modal para mostrar el QR */}
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
      {/* Dialog para dar de baja local a guia */}

      <Dialog
        open={openAnulacion}
      >
        <DialogTitle>Anulación de Guía</DialogTitle>
        <DialogContent sx={{ maxWidth: 350 }}>
          <DialogContentText variant='body2' textAlign={'center'}>¿Desea anular el comprobante {guiaSeleccionadaAnula?.serie}-{guiaSeleccionadaAnula?.numero}?</DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button size='small' variant='contained' color='success' onClick={handleAnular} >Aceptar</Button>
          <Button size='small' variant='contained' color='error' onClick={() => setopenAnulacion(false)} >Cancelar</Button>
        </DialogActions>

      </Dialog>
      {
        datosParaProcesar &&
        <ProcesarGuiaModal
          open={modalOpen}
          onClose={handleModalClose}
          datosGuia={datosParaProcesar}
          onSuccess={handleProcesoSuccess}
          onError={handleProcesoError}
          idElectronico={guiaSeleccionada?.id}
        />
      }

      {/* Backdrop de consulta */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
        open={isConsulting}
        onClick={undefined} // Deshabilitar cierre por click
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center'
          }}
        >
          {/* Ícono animado */}
          <Box
            sx={{
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.7)',
                },
                '50%': {
                  transform: 'scale(1.2)',
                },
                '100%': {
                  transform: 'scale(0.7)',
                },
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>

          {/* Texto principal */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Consultando...
          </Typography>

          {/* Texto secundario */}
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 300,
              lineHeight: 1.5
            }}
          >
            Verificando el estado del comprobante en SUNAT
          </Typography>

          {/* Indicador de progreso adicional */}
          <CircularProgress
            size={24}
            thickness={4}
            sx={{ color: 'white' }}
          />
        </Box>

        {/* Botón de cierre forzado */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <IconButton
            onClick={handleForceCloseConsulting}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
              width: 56,
              height: 56
            }}
            size="large"
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              display: 'block',
              textAlign: 'center',
              mt: 1,
              fontSize: '0.75rem'
            }}
          >
            Forzar cierre
          </Typography>
        </Box>
      </Backdrop>

      {/* Backdrop de descarga PDF */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
        open={isPdfDownloading}
        onClick={undefined} // Deshabilitar cierre por click
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center'
          }}
        >
          {/* Ícono animado */}
          <Box
            sx={{
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.7)',
                },
                '50%': {
                  transform: 'scale(1.2)',
                },
                '100%': {
                  transform: 'scale(0.7)',
                },
              },
            }}
          >
            <PictureAsPdfIcon sx={{ fontSize: 60, color: 'error.main' }} />
          </Box>

          {/* Texto principal */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Generando PDF...
          </Typography>

          {/* Texto secundario */}
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 300,
              lineHeight: 1.5
            }}
          >
            Regenerando el PDF desde SUNAT con el código QR
          </Typography>

          {/* Indicador de progreso adicional */}
          <CircularProgress
            size={24}
            thickness={4}
            sx={{ color: 'white' }}
          />
        </Box>

        {/* Botón de cierre forzado */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <IconButton
            onClick={handleForceClosePdfDownload}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
              width: 56,
              height: 56
            }}
            size="large"
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              display: 'block',
              textAlign: 'center',
              mt: 1,
              fontSize: '0.75rem'
            }}
          >
            Forzar cierre
          </Typography>
        </Box>
      </Backdrop>
    </>
  )
}

export default TablePanel
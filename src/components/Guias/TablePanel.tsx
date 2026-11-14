import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, TablePagination, useTheme, Theme, SxProps, useMediaQuery, Box, Tooltip, ListItem, styled, Typography, Modal, Button, Backdrop, IconButton, Menu, MenuItem, ListItemIcon, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, Divider, Stack, alpha, darken, lighten } from '@mui/material'
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

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import MoreVertIcon from '@mui/icons-material/MoreVert';

import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/notification.context';

import { useAuthStore } from '../../store/authStore';
import { GuiaServices } from '../../service/GuiaServices';
import QRCode from 'qrcode.react';
import { ModalEnvioGuia } from '../../pages/GuiaRemision/ModalEnvioGuia';
import { useGuiaElectronica } from '../../hooks/useGuiaElectronica';
import { useTokenParamsStore } from '../../store/tokenParamsStore';
import { GuiaElectronicaService } from '../../service/GuiaElectronicaService';
import { PictureAsPdfSharp } from '@mui/icons-material';
import { EmisionService, enProceso, etiquetaFeEstado, FormatoPdf, TipoArchivo } from '../../service/EmisionService';
import VisorPdf from '../VisorPdf';
import { base64APdf, useVisorPdf } from '../../hooks/useVisorPdf';
import { pdfDeGuiaGuardada } from '../../utils/pdfGuia';


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
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  /** Hasta tablet la tabla no entra: se muestran tarjetas. */
  const usarTarjetas = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const { getError, getSuccess } = useNotification()

  const { reintentarConsulta } = useGuiaElectronica();

  const [notasCDR, setNotasCDR] = useState<NotasDatos>(null);

  const [hashQr, setHashQr] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [datosParaProcesar, setDatosParaProcesar] = useState(null)
  const [isConsulting, setIsConsulting] = useState(false)
  const [isPdfDownloading, setIsPdfDownloading] = useState(false)
  const [open, setOpen] = useState(false);

  /** Ver PDF / PDF SUNAT: visor propio (en el celular dibuja las páginas con pdf.js) */
  const visor = useVisorPdf({ onError: getError });

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

  /**
   * Guía enviada por la API de facturación (flujo nuevo): estado y archivos los
   * da guiasapi. Las que no tienen `feId` siguen con el flujo anterior.
   */
  const porApi = (fil: panelguia | null) => Boolean(fil?.feId);

  /** Sin ticket (flujo anterior), ya respondida o de baja: no hay nada que consultar. */
  const sinConsulta = (fil: panelguia) =>
    (!porApi(fil) && !fil.ticket) || fil.estado === 'B' || fil.estado === 'F';

  /** Terminada, de baja o en SUNAT esperando respuesta: no se edita ni se reenvía (guiasapi responde 409). */
  const bloqueada = (fil: panelguia) =>
    fil.estado === 'B' || fil.estado === 'F' || enProceso(fil.feEstado);

  const descargarDeApi = async (fil: panelguia | null, tipo: TipoArchivo, formato: FormatoPdf = 'a4') => {
    if (!fil?.id_despatch) return;
    if (tipo === 'pdf') {
      // A4 ("Ver PDF") o el de SUNAT: se muestran en el visor
      const nombre = `${formato === 'sunat' ? 'SUNAT-' : ''}${fil.serie}-${fil.numero}.pdf`;
      visor.abrir(nombre, (signal) => EmisionService.archivo(fil.id_despatch, 'pdf', formato, signal));
      return;
    }
    try {
      setIsPdfDownloading(true);
      await EmisionService.abrirArchivo(fil.id_despatch, tipo, formato);
    } catch (error) {
      getError(typeof error === 'string' ? error : 'No se pudo obtener el archivo');
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const consultarEnApi = async (fil: panelguia) => {
    try {
      setIsConsulting(true);
      const r = await EmisionService.consultar(fil.id_despatch);
      const texto = r.electronico?.descripcion || r.message || etiquetaFeEstado(r.electronico?.feEstado);
      if (r.exito) getSuccess(texto);
      else getError(texto);
    } finally {
      setIsConsulting(false);
      reFetch();
    }
  };

  const HandleConsult = async (fil: panelguia) => {

    if (fil.estado === "F") {
      getSuccess('El Comprobante ya tiene respuesta, no puede volver a consultar');
      return;
    }
    if (porApi(fil)) {
      await consultarEnApi(fil);
      return;
    }
    if (fil.ticket === "") {
      getError('El comprobante no tiene TICKET, consulte al administrador');
      return;
    }

    try {
      setIsConsulting(true);
      const { ruc } = await useTokenParamsStore.getState().asegurarParams();
      const numeroDocumento = `${ruc}-09-${fil.serie}-${fil.numero}`;
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
    if (porApi(fil)) {
      await descargarDeApi(fil, 'pdf', 'sunat');
      return;
    }
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

  /** "Ver PDF" de una guía del flujo anterior: el A4 que arma el servicio anterior. */
  const handlePickGuiaPdf = (fil: panelguia | null) => {
    if (!fil?.id_despatch) return;
    visor.abrir(`${fil.serie}-${fil.numero}.pdf`, async () => base64APdf(await pdfDeGuiaGuardada(fil.id_despatch)));
  }


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

  // const handleEditGuia = (fila: panelguia) => {
  //   // Navegar a la ruta de edición con el ID de la guía
  //   navigate(`/admin/guiaremision/edit/${fila.id_despatch}`);
  // };

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

  /** Etiqueta y color de cada estado local de la guía. */
  const ESTADOS: Record<string, { texto: string; color: 'default' | 'success' | 'info' | 'warning' | 'error' | 'secondary' }> = {
    G: { texto: 'Generado', color: 'default' },
    S: { texto: 'Firmado', color: 'secondary' },
    E: { texto: 'Enviado', color: 'info' },
    P: { texto: 'Pendiente', color: 'warning' },
    F: { texto: 'Finalizado', color: 'success' },
    B: { texto: 'De baja', color: 'error' },
  };

  const chipEstado = (fil: panelguia) => {
    const estado = ESTADOS[fil.estado] || { texto: fil.estado || '—', color: 'default' as const };
    return <Chip size='small' label={estado.texto} color={estado.color} variant={fil.estado === 'F' ? 'filled' : 'outlined'} />;
  };

  /*
   * Se llaman como funciones, no como <Componente />: definidos dentro del render
   * serían un tipo nuevo en cada render, React volvería a montar el botón ⋮ y el
   * menú perdería su ancla (se abría en la esquina de la pantalla).
   */

  /** Botones de acción de una guía: los mismos en la tabla y en las tarjetas. */
  const acciones = (fil: panelguia) => (
    <>
      <Tooltip title="Consultar ticket en SUNAT" disableHoverListener={sinConsulta(fil)}>
        <span>
          <IconButton size="small" color="success" disabled={sinConsulta(fil)} onClick={() => HandleConsult(fil)} sx={AnimatedIconButtonStyles} aria-label="Consultar en SUNAT">
            <FindInPageIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Regenerar PDF desde SUNAT" disableHoverListener={fil.hashQr === ""}>
        <span>
          <IconButton size="small" color="warning" disabled={fil.hashQr === ""} onClick={() => HandleReDowloadFilePdf(fil)} sx={AnimatedIconButtonStyles} aria-label="Regenerar PDF">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {user?.perfil === 'admin' && (
        <Tooltip title="Reenviar guía corregida" disableHoverListener={bloqueada(fil)}>
          <span>
            <IconButton size="small" color="info" disabled={bloqueada(fil)} onClick={() => HandleRegenerar(fil)} sx={AnimatedIconButtonStyles} aria-label="Reenviar guía">
              <SendIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {user?.perfil === 'admin' && (
        <Tooltip title="Dar de baja guía" disableHoverListener={fil.estado !== 'F'}>
          <span>
            <IconButton size="small" color="error" disabled={fil.estado !== 'F'} onClick={() => handleSeleccionarGuiaAnula(fil)} sx={AnimatedIconButtonStyles} aria-label="Dar de baja">
              <DoDisturbIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </>
  );

  const botonEditar = (fil: panelguia) => (
    <Tooltip title="Editar guía" disableHoverListener={bloqueada(fil)}>
      <span>
        <IconButton size="small" color="secondary" disabled={bloqueada(fil)} onClick={() => handleEditGuiaNueva(fil)} sx={AnimatedIconButtonStyles} aria-label="Editar guía">
          <AutoAwesomeIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );

  const botonMas = (fil: panelguia) => (
    <IconButton
      onClick={(e) => handleOpenMenu(e, fil)}
      size='small'
      aria-controls={openMenu ? 'menu-guia' : undefined}
      aria-haspopup="true"
      aria-expanded={openMenu && selectedRowForMenu?.id === fil.id ? 'true' : undefined}
      aria-label="Más opciones"
      sx={AnimatedIconButtonStyles}
    >
      <MoreVertIcon fontSize="small" />
    </IconButton>
  );

  /**
   * Fondo de los menús emergentes: un tono distinto al de la tabla para que se
   * distingan. Claro: un celeste muy suave del color primario; oscuro: un gris
   * más claro que el fondo de las tarjetas.
   */
  const fondoMenu = theme.palette.mode === 'dark'
    ? lighten(theme.palette.background.paper, 0.1)
    : lighten(theme.palette.primary.main, 0.92);
  const hoverMenu = theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.light, 0.16)
    : darken(fondoMenu, 0.06);

  const colorFila = (fil: panelguia) => (fil.estado === 'B' ? theme.palette.error.main : 'inherit');

  /* ---------- Celular y tablet: una tarjeta por guía ---------- */
  const tarjetas = (
    <Stack spacing={1.25}>
      {isLoading ? (
        <Box py={6} display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : guias?.length ? (
        guias.map((fil) => (
          <Paper
            key={fil.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              borderLeft: 4,
              borderLeftColor: fil.estado === 'B' ? 'error.main' : fil.estado === 'F' ? 'success.main' : 'divider',
            }}
          >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
              <Box minWidth={0}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ color: colorFila(fil) }}>
                  {fil.serie}-{fil.numero}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fil.fecha}{fil.name ? ` · ${fil.name}` : ''}
                </Typography>
              </Box>
              {chipEstado(fil)}
            </Box>

            {(fil.descripcion || fil.codigoSunat) && (
              <Typography variant="body2" mt={1} sx={{ color: colorFila(fil), wordBreak: 'break-word' }}>
                {fil.codigoSunat ? <strong>{fil.codigoSunat} · </strong> : null}
                {fil.descripcion}
              </Typography>
            )}

            <Divider sx={{ my: 1 }} />

            <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
              {acciones(fil)}
              <Box flex={1} />
              {botonEditar(fil)}
              {botonMas(fil)}
            </Box>
          </Paper>
        ))
      ) : (
        <Paper variant="outlined" sx={{ py: 6, textAlign: 'center', borderRadius: 2.5 }}>
          <Typography color="text.secondary">No hay resultados</Typography>
        </Paper>
      )}
    </Stack>
  );

  /* ---------- Escritorio: tabla ---------- */
  const tabla = (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5 }}>
      <Table aria-label="Guías emitidas" size="small">
        <TableHead sx={customTableHeader}>
          <TableRow>
            <TableCell width={"1%"}>Id</TableCell>
            <TableCell width={"5%"}>Serie</TableCell>
            <TableCell width={"5%"}>Num</TableCell>
            <TableCell width={"12%"}>Fecha</TableCell>
            <TableCell width={"5%"}>C.Sunat</TableCell>
            <TableCell width={"30%"}>Descripción</TableCell>
            <TableCell width={"10%"}>Estado</TableCell>
            <TableCell width={"8%"}>Usuario</TableCell>
            <TableCell width={"14%"} align="center">Acciones</TableCell>
            <TableCell width={"5%"} align="center">Editar</TableCell>
            <TableCell width={"5%"} align="center">Más</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow style={{ height: 53 * rowsPerPage }}><TableCell colSpan={11} align="center"><CircularProgress /></TableCell></TableRow>
          ) : guias?.length ? (
            guias.map((fil) => (
              <TableRow key={fil.id} hover>
                <TableCell sx={{ ...TableCellStyles, color: colorFila(fil) }}>{fil.id}</TableCell>
                <TableCell sx={{ ...TableCellStyles, color: colorFila(fil) }}>{fil.serie}</TableCell>
                <TableCell sx={{ ...TableCellStyles, color: colorFila(fil) }}>{fil.numero}</TableCell>
                <TableCell sx={{ ...TableCellStyles, color: colorFila(fil) }}>{fil.fecha}</TableCell>
                <TableCell sx={{ ...TableCellStyles, color: colorFila(fil) }}>{fil.codigoSunat}</TableCell>
                <TableCell sx={{ ...TableCellStyles, color: colorFila(fil) }}>{fil.descripcion}</TableCell>
                <TableCell sx={TableCellStyles}>{chipEstado(fil)}</TableCell>
                <TableCell sx={{ ...TableCellStyles, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colorFila(fil) }}>{fil.name}</TableCell>
                <TableCell sx={TableCellStyles} align="center">
                  <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                    {acciones(fil)}
                  </Box>
                </TableCell>
                <TableCell sx={TableCellStyles} align="center">{botonEditar(fil)}</TableCell>
                <TableCell sx={TableCellStyles} align="center">{botonMas(fil)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow style={{ height: 53 * rowsPerPage }}><TableCell colSpan={11} align="center"><Typography variant="h6" color="text.secondary">No hay resultados</Typography></TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      {usarTarjetas ? tarjetas : tabla}

      {/* Un solo menú "Más" para todas las guías */}
      <Menu
        anchorEl={anchorEl}
        id="menu-guia"
        open={openMenu}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            bgcolor: fondoMenu,
            border: `1px solid ${theme.palette.divider}`,
            '& .MuiMenuItem-root:hover': { bgcolor: hoverMenu },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              // La flecha toma el mismo fondo y borde que el menú
              bgcolor: fondoMenu,
              borderTop: `1px solid ${theme.palette.divider}`,
              borderLeft: `1px solid ${theme.palette.divider}`,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => porApi(selectedRowForMenu)
          ? descargarDeApi(selectedRowForMenu, 'pdf', 'a4')
          : handlePickGuiaPdf(selectedRowForMenu)}>
          <ListItemIcon><VisibilityIcon color='error' fontSize='small' /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem' }}>Ver PDF</Typography>
        </MenuItem>
        <MenuItem onClick={() => porApi(selectedRowForMenu)
          ? descargarDeApi(selectedRowForMenu, 'pdf', 'sunat')
          : HandleDowloadFilePdf(selectedRowForMenu?.rutaPdf)}>
          <ListItemIcon><PictureAsPdfSharp color='error' fontSize='small' /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem' }}>Descargar PDF SUNAT</Typography>
        </MenuItem>
        <MenuItem onClick={() => porApi(selectedRowForMenu)
          ? descargarDeApi(selectedRowForMenu, 'xml')
          : HandleDowloadFile(selectedRowForMenu?.rutaXml)}>
          <ListItemIcon><AttachFileIcon color='primary' fontSize='small' /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem' }}>Descargar XML</Typography>
        </MenuItem>
        <MenuItem onClick={() => porApi(selectedRowForMenu)
          ? descargarDeApi(selectedRowForMenu, 'cdr')
          : HandleDowloadFile(selectedRowForMenu?.rutaCdr)}>
          <ListItemIcon><FolderSpecialIcon color='success' fontSize='small' /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem' }}>Descargar CDR</Typography>
        </MenuItem>
        <Tooltip title={selectedRowForMenu ? <CustomToolTip fil={selectedRowForMenu} /> : ''} placement="left">
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleConsultarNotas(selectedRowForMenu);
            }}
            onMouseEnter={(e) => e.stopPropagation()}
          >
            <ListItemIcon><FormatListBulletedIcon color='success' fontSize='small' /></ListItemIcon>
            <Typography sx={{ fontSize: '0.85rem' }}>Ver Notas</Typography>
          </MenuItem>
        </Tooltip>
        <MenuItem onClick={() => handleUrlHashQr(selectedRowForMenu?.feQrUrl || selectedRowForMenu?.hashQr)}>
          <ListItemIcon><LinkIcon color='success' fontSize='small' /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem' }}>Hash QR</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleImageQr(selectedRowForMenu?.feQrUrl || selectedRowForMenu?.hashQr)}>
          <ListItemIcon><QrCodeIcon fontSize='small' /></ListItemIcon>
          <Typography sx={{ fontSize: '0.85rem' }}>Ver QR en imagen</Typography>
        </MenuItem>
      </Menu>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={usarTarjetas ? "Por página:" : "Filas por página:"}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
        sx={{ '& .MuiTablePagination-toolbar': { px: { xs: 0, sm: 2 } } }}
      />
      <VisorPdf {...visor.props} />

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
        <ModalEnvioGuia
          open={modalOpen}
          onClose={handleModalClose}
          datosGuia={datosParaProcesar}
          onSuccess={handleProcesoSuccess}
          onError={handleProcesoError}
          idElectronico={guiaSeleccionada?.id}
          idDespatch={guiaSeleccionada?.id_despatch}
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
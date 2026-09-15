// components/ProcesarGuiaModal.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Button,
  Box,
  Typography,
  Backdrop,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  AccessTime,
  Refresh,
  Assignment,
  Description,
  Info,
  Edit,
  DoneAll,
  Cancel
} from '@mui/icons-material';
import { useGuiaElectronica } from '../../hooks/useGuiaElectronica';
import { GuiaElectronicaService } from '../../service/GuiaElectronicaService';
import { useNotification } from '../../context/notification.context';

// Componente helper para crear enlaces de archivos estilizados
const FileLink: React.FC<{
  url: string;
  children: React.ReactNode;
  sx?: any
}> = ({ url, children, sx = {} }) => {
  const fullUrl = `${import.meta.env.VITE_API_URL_GUIAS}${url}`;

  return (
    <Box
      component="a"
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        color: 'text.primary',
        textDecoration: 'none',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
        display: 'inline-block',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
          borderColor: 'primary.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        ...sx
      }}
    >
      {children}
    </Box>
  );
};


const pasos = [
  'Verificando autenticación',
  'Generando guía',
  'Firmando documento',
  'Enviando al servidor',
  'Consultando estado final'
];

interface ProcesarGuiaModalProps {
  open: boolean;
  onClose: () => void;
  datosGuia: any,
  idElectronico: number,
  onSuccess: (resultado: any) => void;
  onError: (error: any) => void

}


export const ProcesarGuiaModal = ({
  open,
  onClose,
  datosGuia,
  onSuccess,
  idElectronico,
  onError
}: ProcesarGuiaModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const {getError} = useNotification()

  const {
    procesarGuiaCompleta,
    reintentarConsulta,
    resetearEstado,
    loading,
    progress,
    error,
    resultado,
    pasoActual,
    datosPasos
  } = useGuiaElectronica();

  const [procesando, setProcesando] = React.useState(false);
  const [completado, setCompletado] = React.useState(false);
  const [procesoFallido, setProcesoFallido] = React.useState(false);
  const [datosReintento, setDatosReintento] = React.useState<{ numeroDocumento: string, ticket: string } | null>(null);
  const [ticketDisponible, setTicketDisponible] = React.useState<string | null>(null);
  const [resultadoLocal, setResultadoLocal] = React.useState<any>(null);
  const [downloadingHash, setDownloadingHash] = React.useState<boolean>(false);
  const [mostrandoProgress, setMostrandoProgress] = React.useState<boolean>(false);

  // Ref para el scroll automático en móvil
  const stepperRef = React.useRef<HTMLDivElement>(null);
  const dialogContentRef = React.useRef<HTMLDivElement>(null);

  // Iniciar el proceso automáticamente cuando se abre el modal
  React.useEffect(() => {

    // console.log(datosGuia);
    // console.log(procesando);
    // console.log(completado);
    // console.log(open);
    if (open && datosGuia && !procesando && !completado) {
      handleProcesar();
    }
  }, [open, datosGuia]);

  // Reset states when modal opens (seguridad adicional)
  React.useEffect(() => {
    if (open) {
      // Resetear por seguridad (el reset principal está en handleClose)
      resetearEstado();
      setProcesando(false);
      setCompletado(false);
      setProcesoFallido(false);
      setDatosReintento(null);
      setTicketDisponible(null);
      setMostrandoProgress(false);
    }
  }, [open, resetearEstado]);

  // Auto-scroll cuando cambia el paso (para todas las pantallas)
  React.useEffect(() => {
    if (pasoActual > 0 && dialogContentRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMobile) {
          // En móvil: scroll hacia el paso actual del stepper
          const stepElements = dialogContentRef.current?.querySelectorAll('.MuiStep-root');
          if (stepElements && stepElements[pasoActual]) {
            stepElements[pasoActual].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        } else {
          // En pantallas normales: scroll hacia arriba del contenido
          dialogContentRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 500); // Delay para que se complete la animación del stepper

      return () => clearTimeout(timeoutId);
    }
  }, [pasoActual, isMobile]);

  // Detectar cuando hay ticket disponible (después del proceso)
  React.useEffect(() => {
    // Solo procesar si estamos en un proceso activo (procesando o ya completado/fallido)
    // y no en la inicialización del modal
    if ((procesando || completado || procesoFallido) &&
      datosPasos?.enviar?.completado &&
      datosPasos.enviar.datos?.ticket) {

      setTicketDisponible(datosPasos.enviar.datos.ticket);

      // Siempre preparar datos para reintento cuando hay envío completado
      const serie = datosGuia.serie || datosGuia.datosGenerales?.serie;
      const correlativo = datosGuia.correlativo || datosGuia.datosGenerales?.correlativo;
      const tipoDoc = datosGuia.tipoDoc || datosGuia.datosGenerales?.tipoDoc;

      setDatosReintento({
        numeroDocumento: `${datosGuia.destinatario?.numDoc || 'RUC'}-${tipoDoc}-${serie}-${correlativo}`,
        ticket: datosPasos.enviar.datos.ticket
      });
    }
  }, [datosPasos?.enviar, datosGuia, procesando, completado, procesoFallido]);

  const handleProcesar = async () => {
    setProcesando(true);
    setMostrandoProgress(true);
    setProcesoFallido(false);
    setDatosReintento(null);
    setTicketDisponible(null);

    try {
      const resultado = await procesarGuiaCompleta(datosGuia, idElectronico);
      // console.log(resultado);

      // Verificar si todo el proceso se completó exitosamente
      if (resultado.pasos.consultar?.completado) {
        setCompletado(true);
        setResultadoLocal(resultado);
        // onSuccess?.(resultado);
      } else {
        // Si no se completó la consulta, marcar como proceso fallido
        // pero el useEffect ya manejará el ticket y reintento
        setProcesoFallido(true);
      }

    } catch (err: any) {
      console.error('Error en el proceso:', err);
      setProcesoFallido(true);
      const errorMessage = err?.message || err?.toString() || 'Error desconocido';
      onError?.(errorMessage);
    } finally {
      setProcesando(false);
      setMostrandoProgress(false);
    }
  };

  const handleReintentarConsulta = async () => {
    if (!datosReintento) return;

    setProcesando(true);
    setProcesoFallido(false);

    try {
      const resultadoConsulta = await reintentarConsulta(
        datosReintento.numeroDocumento,
        datosReintento.ticket,
        idElectronico
      );

      // Manejar la nueva estructura de respuesta
      if (resultadoConsulta.completado && resultadoConsulta.success) {
        // Consulta exitosa
        setCompletado(true);
        setResultadoLocal(resultadoConsulta);
        // onSuccess?.(resultadoConsulta); // Comentado: se ejecutará en handleClose cuando el usuario haga clic en "Cerrar"
      } else if (!resultadoConsulta.completado && resultadoConsulta.datos?.puedeReintentar) {
        // Error en consulta pero se puede reintentar - no marcar como completado ni fallido
        setProcesoFallido(false);
        setCompletado(false);
        // Mostrar información del error pero permitir otro reintento
        console.warn('Consulta falló pero se puede reintentar:', resultadoConsulta.datos);
      } else {
        // Error definitivo
        setProcesoFallido(true);
        setCompletado(false);
        const errorMessage = resultadoConsulta.datos?.descripcion || 'Error al consultar el comprobante';
        onError?.(errorMessage);
      }

    } catch (err: any) {
      console.error('Error al reintentar consulta:', err);
      setProcesoFallido(true);
      setCompletado(false);
      const errorMessage = err?.message || err?.toString() || 'Error al reintentar consulta';
      onError?.(errorMessage);
    } finally {
      setProcesando(false);
    }
  };

  const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS

  // Función helper para detectar tipo MIME desde base64
  const getMimeTypeFromBase64 = (base64: string): string => {
    if (base64.startsWith('data:')) {
      return base64.split(';')[0].split(':')[1];
    }
    
    // Detectar por contenido (simplificado)
    const header = base64.substring(0, 10);
    if (header.startsWith('JVBERi')) return 'application/pdf';
    if (header.startsWith('iVBORw')) return 'image/png';
    if (header.startsWith('/9j/4A')) return 'image/jpeg';
    
    return 'application/pdf'; // Default a PDF
  };

  const HandleReDowloadFilePdf = async (url: string) => {



    try {
      setDownloadingHash(true);
      const serie = datosGuia.serie || datosGuia.datosGenerales?.serie;
      const correlativo = datosGuia.correlativo || datosGuia.datosGenerales?.correlativo;
      const response = await GuiaElectronicaService.tryDownloadAgain(url, `${serie}-${correlativo}`);

      if (response.status === 'success') {
        HandleDowloadFilePdf(response.base64)
      }
      else {
        getError('No se pudo descargar el archivo, consulte con el ADMINISTRADOR');

      }  
      
    } catch (error) {
      console.log(error);
      getError(error || 'No se pudo descargar el archivo, consulte con el ADMINISTRADOR');
      
    } finally {
      setDownloadingHash(false);
    }
  }

  const HandleDowloadFilePdf = async (base64String: string) => {
    try {
      // Verificar si es una URL tradicional o un base64
      if (base64String.startsWith('/') || base64String.startsWith('http')) {
        // Lógica original para URLs
        const fileUrl = base64String.startsWith('http') ? base64String : `${API_GUIAS}${base64String}`;
        if (fileUrl) {
          const partUrl = fileUrl.split('/');
          if (partUrl.length > 1) {
            const fileName = partUrl[partUrl.length - 1];
            if (fileName.includes('.')) {
              const link = document.createElement('a');
              link.href = fileUrl;
              link.setAttribute('download', fileName);
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              getError('Archivo no existe, consulte con el ADMINISTRADOR');
            }
          } else {
            getError('Archivo no existe, consulte con el ADMINISTRADOR');
          }
        } else {
          getError('Archivo no existe, consulte con el ADMINISTRADOR');
        }
        return;
      }

      // Nueva lógica para base64
      console.log('Procesando base64 string para visualización...');
      
      // 1. Determinar el tipo MIME del base64
      const mimeType = getMimeTypeFromBase64(base64String);
      console.log('Tipo MIME detectado:', mimeType);
      
      // 2. Crear blob desde base64
      const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // 3. Crear URL del blob
      const blobUrl = URL.createObjectURL(blob);
      console.log('Blob URL creado:', blobUrl);
      
      // 4. Abrir en nueva ventana para visualizar
      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow) {
        // Si el popup fue bloqueado, crear link de descarga como fallback
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `documento_${Date.now()}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Popup bloqueado, descarga iniciada como fallback');
      } else {
        console.log('Archivo abierto en nueva ventana');
      }
      
      // 5. Limpiar URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('Blob URL limpiado de memoria');
      }, 10000);
      
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      getError('Error al procesar el archivo. Verifique que sea un archivo válido.');
    }
  }

  const getModalTitle = () => {
    if (completado) return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle color="success" />
        Proceso Completado Exitosamente
      </Box>
    );
    if (procesoFallido) return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Error color="error" />
        Proceso Interrumpido
      </Box>
    );
    if (loading) return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime color="primary" />
        Procesando Guía Electrónica...
      </Box>
    );
    return 'Procesando Guía Electrónica';
  };

  // Función auxiliar para convertir errores a string de forma segura
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.toString) return error.toString();
    return 'Error desconocido';
  };

  const handleClose = () => {
    if (!loading) {
      // Si el proceso se completó exitosamente, ejecutar onSuccess antes de cerrar
      if (completado && (resultadoLocal || resultado)) {
        onSuccess?.(resultadoLocal || resultado);
      }

      // Resetear todos los estados antes de cerrar
      resetearEstado();
      setProcesando(false);
      setCompletado(false);
      setProcesoFallido(false);
      setDatosReintento(null);
      setTicketDisponible(null);
      setResultadoLocal(null);
      setDownloadingHash(false);
      setMostrandoProgress(false);

      // Cerrar el modal
      onClose();
    }
  };

  // Función para determinar si puede regresar al índice (editar)
  const puedeRegresarAlIndice = () => {
    // Si hay datos de consulta completados, verificar el estado
    if (datosPasos?.consultar?.completado && datosPasos.consultar.datos?.estadoSunat !== undefined) {
      const estadoSunat = datosPasos.consultar.datos.estadoSunat;

      if (typeof estadoSunat === 'string') {
        // Código "0": Aceptado definitivo - NO puede regresar
        if (estadoSunat === '0') return false;
        // Código "98": Ticket pendiente - NO puede regresar pero SÍ puede consultar
        if (estadoSunat === '98') return false;
        // Otros códigos: Puede regresar a editar
        return true;
      }
      return true;
    }

    // Si hay datos de consulta con ERROR, verificar el código de error
    if (datosPasos?.consultar && !datosPasos.consultar.completado && datosPasos.consultar.datos?.codigoError) {
      const codigoError = datosPasos.consultar.datos.codigoError;

      if (typeof codigoError === 'string') {
        // Código "98": Ticket pendiente - NO puede regresar pero SÍ puede consultar
        if (codigoError === '98') return false;
        // Código "99": Error específico - puede regresar (para mostrar error)
        if (codigoError === '99') return true;
      }
    }

    // También verificar estadoSunat directamente para código 99
    if (datosPasos?.consultar && !datosPasos.consultar.completado && datosPasos.consultar.datos?.estadoSunat === '99') {
      return true;
    }

    // Si hay ticket pero NO hay respuesta en el paso 4 (consulta), NO puede cancelar/regresar
    if (ticketDisponible && !datosPasos?.consultar?.completado) {
      return false;
    }

    // En otros casos, puede editar
    return true;
  };

  // Función para determinar si puede consultar el ticket
  const puedeConsultarTicket = () => {
    // Código "98": Puede consultar ticket aunque no pueda regresar
    if (datosPasos?.consultar?.completado && datosPasos.consultar.datos?.estadoSunat === '98') {
      return true;
    }

    // Error con código "98": Puede consultar ticket
    if (datosPasos?.consultar && !datosPasos.consultar.completado && datosPasos.consultar.datos?.codigoError === '98') {
      return true;
    }

    // En otros casos donde hay ticket y consulta falló
    return ticketDisponible && !datosPasos?.consultar?.completado;
  };

  // Función para determinar si hay error específico que mostrar (código 99)
  const tieneErrorEspecifico = () => {
    // console.log('Verificando error específico:', datosPasos?.consultar);

    // Verificar si hay consulta con error y código 99
    const tieneConsultaConError = datosPasos?.consultar && !datosPasos.consultar.completado;
    const esCodigoError99 = datosPasos?.consultar?.datos?.codigoError === '99';
    const esEstadoSunat99 = datosPasos?.consultar?.datos?.estadoSunat === '99';

    // console.log('Tiene consulta con error:', tieneConsultaConError);
    // console.log('Es código error 99:', esCodigoError99);
    // console.log('Es estado SUNAT 99:', esEstadoSunat99);

    return tieneConsultaConError && (esCodigoError99 || esEstadoSunat99);
  };

  // Función para obtener el texto del botón de cierre
  const getTextoBotonCierre = () => {
    if (completado) return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle fontSize="small" />
        Cerrar
      </Box>
    );

    if (procesoFallido) {
      // Casos específicos por código de estado/error
      const estadoSunat = datosPasos?.consultar?.datos?.estadoSunat;
      const codigoError = datosPasos?.consultar?.datos?.codigoError;

      // Código "0": Solo cerrar/finalizar
      if (estadoSunat === '0') {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" />
            Finalizar (Aceptado)
          </Box>
        );
      }

      // Código "98": No puede regresar pero sí consultar
      if (estadoSunat === '98' || codigoError === '98') {
        return ticketDisponible ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" />
            Finalizar (Ticket Pendiente)
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cancel fontSize="small" />
            No se puede cancelar
          </Box>
        );
      }

      // Código "99": Error específico - puede regresar para seguir editando
      if (codigoError === '99' || estadoSunat === '99') {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit fontSize="small" />
            Seguir Editando
          </Box>
        );
      }

      // Casos generales
      if (ticketDisponible) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" />
            Finalizar (Ticket guardado)
          </Box>
        );
      } else {
        return puedeRegresarAlIndice() ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit fontSize="small" />
            Regresar
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cancel fontSize="small" />
            No se puede cancelar
          </Box>
        );
      }
    }

    return loading ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime fontSize="small" />
        Procesando...
      </Box>
    ) : (puedeRegresarAlIndice() ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Edit fontSize="small" />
        Regresar a Editar
      </Box>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Cancel fontSize="small" />
        No se puede cancelar
      </Box>
    ));
  };

  // Función para obtener el color del botón de cierre
  const getColorBotonCierre = () => {
    if (completado) return 'success';

    if (procesoFallido) {
      const estadoSunat = datosPasos?.consultar?.datos?.estadoSunat;
      const codigoError = datosPasos?.consultar?.datos?.codigoError;

      // Código "0": Verde (éxito definitivo)
      if (estadoSunat === '0') return 'success';

      // Código "98": Azul/info (pendiente)
      if (estadoSunat === '98' || codigoError === '98') return 'info';

      // Código "99": Rojo (error específico)
      if (codigoError === '99') return 'error';

      // Casos generales
      return ticketDisponible ? 'success' : (puedeRegresarAlIndice() ? 'warning' : 'error');
    }

    return puedeRegresarAlIndice() ? 'warning' : 'error';
  };

  // Función para determinar si el botón de cierre está deshabilitado
  const isBotonCierreDeshabilitado = () => {
    if (loading) return true;

    // Nunca deshabilitar para código "0" (siempre puede cerrar)
    if (datosPasos?.consultar?.datos?.estadoSunat === '0') return false;

    // Para código "98" nunca deshabilitar (siempre puede finalizar o consultar)
    const estadoSunat = datosPasos?.consultar?.datos?.estadoSunat;
    const codigoError = datosPasos?.consultar?.datos?.codigoError;
    if (estadoSunat === '98' || codigoError === '98') return false;

    // Para código "99" nunca deshabilitar (puede regresar para seguir editando)
    if (codigoError === '99' || estadoSunat === '99') return false;

    // Si hay ticket pero no hay respuesta de consulta, deshabilitar
    if (ticketDisponible && !datosPasos?.consultar?.completado) {
      return true;
    }

    return false;
  };

  // Función para prevenir el cierre del modal al hacer clic fuera
  const handleBackdropClick = (reason: string) => {
    // Solo permite cerrar si el reason es 'backdropClick' y no estamos en loading
    if (reason === 'backdropClick') {
      return; // No hacer nada, prevenir el cierre
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleBackdropClick}
        maxWidth={isMobile ? "xs" : "md"}
        fullWidth
        fullScreen={isMobile}
        disableEscapeKeyDown={true}
        PaperProps={{
          sx: {
            ...(isMobile && {
              margin: 0,
              maxHeight: '100vh',
              borderRadius: 0,
            }),
            ...(isTablet && {
              margin: 1,
              maxHeight: 'calc(100vh - 16px)',
            })
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          {getModalTitle()}
        </DialogTitle>

        {/* Stepper fijo - fuera del DialogContent en pantallas normales */}
        {!isMobile && (
          <Box sx={{
            px: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}>
            <Stepper
              ref={stepperRef}
              activeStep={pasoActual}
              alternativeLabel
            >
              {pasos.map((label, index) => (
                <Step key={label} completed={pasoActual > index}>
                  <StepLabel
                    error={error && pasoActual === index}
                    StepIconProps={{
                      sx: {
                        '&.Mui-error': {
                          color: 'error.main'
                        },
                        '&.Mui-completed': {
                          color: 'success.main'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <Typography variant="body1">
                        {label}
                      </Typography>
{/* 
                      Debug temporal
                      {(() => {
                        console.log(`Paso ${index}: loading=${loading}, procesando=${procesando}, mostrandoProgress=${mostrandoProgress}, pasoActual=${pasoActual}, mostrar=${mostrandoProgress && pasoActual === index}`);
                        return null;
                      })()} */}
                      
                      {/* Mostrar CircularProgress si está procesando este paso específico */}
                      {(mostrandoProgress && pasoActual === index) && (
                        <CircularProgress
                          size={20}
                          thickness={4}
                          sx={{
                            color: 'primary.main',
                            ml: 0.5
                          }}
                        />
                      )}
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        <DialogContent
          ref={dialogContentRef}
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 1 : 2,
            ...(isMobile && {
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }),
            ...(!isMobile && {
              maxHeight: '70vh',
              overflowY: 'auto'
            })
          }}
        >
          {/* Stepper solo en móvil */}
          {isMobile && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Stepper
                ref={stepperRef}
                activeStep={pasoActual}
                orientation="vertical"
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem'
                  },
                  '& .MuiStepContent-root': {
                    paddingLeft: 2
                  }
                }}
              >
                {pasos.map((label, index) => (
                  <Step key={label} completed={pasoActual > index}>
                    <StepLabel
                      error={error && pasoActual === index}
                      StepIconProps={{
                        sx: {
                          '&.Mui-error': {
                            color: 'error.main'
                          },
                          '&.Mui-completed': {
                            color: 'success.main'
                          },
                          fontSize: '1.2rem'
                        }
                      }}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {label.replace('Consultando estado final', 'Consultando estado')}
                        </Typography>

                        {/* Mostrar CircularProgress si está procesando este paso específico */}
                        {(mostrandoProgress && pasoActual === index) && (
                          <CircularProgress
                            size={16}
                            thickness={4}
                            sx={{
                              color: 'primary.main',
                              ml: 0.5
                            }}
                          />
                        )}
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {loading && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress
                  size={isMobile ? 20 : 24}
                  thickness={4}
                  color="primary"
                />
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  color="primary"
                  sx={{ fontWeight: 'medium' }}
                >
                  Ejecutando: {pasos[pasoActual] || 'Procesando...'}
                </Typography>
              </Box>
              <LinearProgress
                sx={{
                  height: isMobile ? 4 : 6,
                  borderRadius: 2
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  textAlign: 'center',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {progress}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography
                variant={isMobile ? "body2" : "subtitle2"}
                sx={{ fontWeight: 'bold' }}
              >
                Error en paso: {pasos[pasoActual] || 'Proceso'}
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                <strong>Descripción:</strong> {getErrorMessage(error)}
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                sx={{
                  mt: 1,
                  fontSize: isMobile ? '0.7rem' : '0.875rem',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Info fontSize="small" />
                Puede intentar nuevamente o contactar al soporte técnico si el problema persiste.
              </Typography>
            </Alert>
          )}

          {procesoFallido && !loading && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography
                variant={isMobile ? "body2" : "subtitle2"}
                sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Warning />
                El proceso no se completó correctamente
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                El proceso de la guía electrónica se interrumpió en el paso: <strong>{pasos[pasoActual] || 'Desconocido'}</strong>
              </Typography>
              <Typography
                variant={isMobile ? "caption" : "body2"}
                sx={{
                  mt: 1,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Puede intentar procesar nuevamente o verificar los datos ingresados.
              </Typography>
            </Alert>
          )}

          {completado && (resultado || resultadoLocal) && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>¡Proceso completado exitosamente!</strong>
              <br />
              {resultado && (
                <>
                  Número de guía: {datosGuia.serie - datosGuia.correlativo || 'N/A'}
                  <br />
                  Estado: {resultado.estado || 'Completado'}
                </>
              )}
              {resultadoLocal && resultadoLocal.datos && (
                <>
                  {resultadoLocal.datos.descripcion && (
                    <>
                      Estado: {resultadoLocal.datos.descripcion}
                      <br />
                    </>
                  )}
                  {resultadoLocal.datos.estadoSunat && (
                    <>Código SUNAT: {resultadoLocal.datos.estadoSunat}</>
                  )}
                </>
              )}
            </Alert>
          )}

          {/* Loading indicators para cada paso - fuera de datosPasos para que aparezcan inmediatamente */}
          <Box sx={{ mb: 2 }}>
            {/* Loading para Paso 0 (Autenticación) si está en progreso */}
            {loading && pasoActual === 0 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress 
                    size={16} 
                    thickness={4} 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                    }} 
                  />
                  Paso 0: Verificando Autenticación...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Validando credenciales y conexión con SUNAT
                </Typography>
              </Alert>
            )}

            {/* Loading para Paso 1 si está en progreso */}
            {loading && pasoActual === 1 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress 
                    size={16} 
                    thickness={4} 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                    }} 
                  />
                  Paso 1: Generando Guía...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Creando el archivo XML de la guía electrónica
                </Typography>
              </Alert>
            )}

            {/* Loading para Paso 2 si está en progreso */}
            {loading && pasoActual === 2 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress 
                    size={16} 
                    thickness={4} 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                    }} 
                  />
                  Paso 2: Firmando Documento...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aplicando firma digital al XML de la guía
                </Typography>
              </Alert>
            )}

            {/* Loading para Paso 3 si está en progreso */}
            {loading && pasoActual === 3 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress 
                    size={16} 
                    thickness={4} 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                    }} 
                  />
                  Paso 3: Enviando al Servidor...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transmitiendo la guía firmada a SUNAT
                </Typography>
              </Alert>
            )}

            {/* Loading para Paso 4 si está en progreso */}
            {loading && pasoActual === 4 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress 
                    size={16} 
                    thickness={4} 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                    }} 
                  />
                  Paso 4: Consultando Estado Final...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verificando el estado de procesamiento en SUNAT
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Información detallada de cada paso completado */}
          {datosPasos && (
            <Box sx={{ mb: 2 }}>

              {datosPasos.generar?.completado && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    Paso 1: Guía Generada
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Ruta XML:</strong>
                  </Typography>
                  {datosPasos.generar.datos?.rutaXml ? (
                    <FileLink url={datosPasos.generar.datos.rutaXml}>
                      <Description fontSize="small" sx={{ mr: 0.5 }} />
                      {datosPasos.generar.datos.rutaXml.split('/').pop() || 'archivo.xml'}
                    </FileLink>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No disponible
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {datosPasos.generar.datos?.descripcion}
                  </Typography>
                </Alert>
              )}

              {datosPasos.firmar?.completado && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    Paso 2: Guía Firmada
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hash:</strong> {datosPasos.firmar.datos?.hash ?
                      `${datosPasos.firmar.datos.hash}` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Ruta XML:</strong>
                  </Typography>
                  {datosPasos.firmar.datos?.rutaXml ? (
                    <FileLink url={datosPasos.firmar.datos.rutaXml}>
                      <Description fontSize="small" sx={{ mr: 0.5 }} />
                      {datosPasos.firmar.datos.rutaXml.split('/').pop() || 'archivo.xml'}
                    </FileLink>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No disponible
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {datosPasos.firmar.datos?.descripcion}
                  </Typography>
                </Alert>
              )}

              {datosPasos.enviar?.completado && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle color="success" fontSize="small" />
                        Paso 3: Guía Enviada
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ticket SUNAT:</strong> {datosPasos.enviar.datos?.ticket}
                      </Typography>
                      <Typography variant="body2">
                        {datosPasos.enviar.datos?.descripcion}
                      </Typography>
                    </Box>
                    {datosReintento && (
                      <Button
                        onClick={handleReintentarConsulta}
                        variant="contained"
                        color="warning"
                        size="small"
                        disabled={loading}
                        sx={{
                          minWidth: isMobile ? '100%' : 'auto',
                          mt: isMobile ? 1 : 0
                        }}
                      >
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime fontSize="small" />
                            Consultando...
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Refresh fontSize="small" />
                            Consultar Estado
                          </Box>
                        )}
                      </Button>
                    )}
                  </Box>
                </Alert>
              )}

              {/* Loading para Paso 3 si está en progreso */}
              {loading && pasoActual === 3 && !datosPasos.enviar?.completado && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress 
                      size={16} 
                      thickness={4} 
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                      }} 
                    />
                    Paso 3: Enviando al Servidor...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transmitiendo la guía firmada a SUNAT
                  </Typography>
                </Alert>
              )}

              {datosPasos.consultar?.completado && (
                <Alert
                  severity={datosPasos.consultar.datos?.estadoSunat === '0' ? "success" : "info"}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {datosPasos.consultar.datos?.estadoSunat === '0' ? (
                      <>
                        <CheckCircle color="success" fontSize="small" />
                        Paso 4: Guía Aceptada por SUNAT
                      </>
                    ) : (
                      <>
                        <CheckCircle color="info" fontSize="small" />
                        Paso 4: Guía Consultada
                      </>
                    )}
                  </Typography>

                  {/* Mostrar códigos siempre */}
                  <Box sx={{ mt: 0.5, mb: 0.5 }}>
                    <Typography variant="body2">
                      <strong>Estado SUNAT:</strong> {datosPasos.consultar.datos?.estadoSunat || 'N/A'}
                    </Typography>
                    {datosPasos.consultar.datos?.codigoSunat && (
                      <Typography variant="body2">
                        <strong>Código SUNAT:</strong> {datosPasos.consultar.datos.codigoSunat}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Hash QR:</strong>
                  </Typography>
                  {datosPasos.consultar.datos?.hashQr ? (
                    <Box
                      component="button"
                      onClick={() => HandleReDowloadFilePdf(datosPasos.consultar.datos.hashQr)}
                      disabled={downloadingHash}
                      sx={{
                        color: 'text.primary',
                        textDecoration: 'none',
                        cursor: downloadingHash ? 'wait' : 'pointer',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.2s ease',
                        wordBreak: 'break-all',
                        maxWidth: '100%',
                        opacity: downloadingHash ? 0.7 : 1,
                        '&:hover': {
                          backgroundColor: downloadingHash ? undefined : (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                          borderColor: downloadingHash ? undefined : 'primary.main',
                          transform: downloadingHash ? undefined : 'translateY(-1px)',
                          boxShadow: downloadingHash ? undefined : '0 2px 4px rgba(0,0,0,0.1)'
                        },
                        '&:active': {
                          transform: downloadingHash ? undefined : 'translateY(0px)',
                          boxShadow: downloadingHash ? undefined : '0 1px 2px rgba(0,0,0,0.1)'
                        },
                        '&:disabled': {
                          cursor: 'wait',
                          opacity: 0.7
                        }
                      }}
                    >
                      {downloadingHash ? (
                        <CircularProgress 
                          size={16} 
                          thickness={4} 
                          sx={{ 
                            color: (theme) => theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'
                          }} 
                        />
                      ) : (
                        <Info fontSize="small" />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {downloadingHash ? 'Descargando...' : 'Descargar PDF QR'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No disponible
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>CDR:</strong>
                  </Typography>
                  {datosPasos.consultar.datos?.rutaCdr ? (
                    <FileLink url={datosPasos.consultar.datos.rutaCdr}>
                      <Assignment fontSize="small" sx={{ mr: 0.5 }} />
                      {datosPasos.consultar.datos.rutaCdr.split('/').pop() || 'cdr.xml'}
                    </FileLink>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No disponible
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {datosPasos.consultar.datos?.descripcion}
                  </Typography>

                  {/* Mensaje específico para código 0 */}
                  {datosPasos.consultar.datos?.estadoSunat === '0' && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: 'success.main',
                        fontWeight: 'medium',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <DoneAll color="success" fontSize="small" />
                      ¡Guía aceptada definitivamente por SUNAT! El proceso ha sido completado exitosamente.
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Mostrar error de consulta con opción de reintento */}
              {datosPasos.enviar?.completado && !datosPasos.consultar?.completado && datosPasos.consultar?.datos?.puedeReintentar && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" fontSize="small" />
                    Paso 4: Error en Consulta
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ticket:</strong> {datosPasos.consultar.datos?.ticket || datosReintento?.ticket}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Error:</strong> {datosPasos.consultar.datos?.error}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'info.main', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="info" fontSize="small" />
                    La guía fue enviada exitosamente a SUNAT. Puede reintentar la consulta para obtener el estado final.
                  </Typography>
                </Alert>
              )}

              {/* Alert específico para código 98 (Ticket Pendiente) */}
              {puedeConsultarTicket() && (datosPasos?.consultar?.datos?.codigoError === '98' || datosPasos?.consultar?.datos?.estadoSunat === '98') && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime color="info" fontSize="small" />
                        Código 98: Ticket Pendiente de Consulta
                      </Typography>

                      {/* Mostrar códigos si existen */}
                      <Box sx={{ mt: 0.5, mb: 0.5 }}>
                        {datosPasos?.consultar?.datos?.codigoError && (
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            <strong>Código:</strong> {datosPasos.consultar.datos.codigoError}
                          </Typography>
                        )}
                        {datosPasos?.consultar?.datos?.estadoSunat && (
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            <strong>Estado SUNAT:</strong> {datosPasos.consultar.datos.estadoSunat}
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="body2">
                        <strong>Ticket:</strong> {datosPasos.consultar.datos?.ticket || datosReintento?.ticket}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'info.main', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info color="info" fontSize="small" />
                        La guía está en proceso en SUNAT. Puede consultar el estado actual.
                      </Typography>
                    </Box>
                    {datosReintento && (
                      <Button
                        onClick={handleReintentarConsulta}
                        variant="contained"
                        color="info"
                        size="small"
                        disabled={loading}
                        sx={{
                          minWidth: isMobile ? '100%' : 'auto',
                          mt: isMobile ? 1 : 0
                        }}
                      >
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress 
                              size={16} 
                              thickness={4}
                              sx={{ 
                                color: (theme) => theme.palette.mode === 'dark' ? 'inherit' : 'inherit'
                              }} 
                            />
                            Consultando...
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Refresh fontSize="small" />
                            Consultar Estado
                          </Box>
                        )}
                      </Button>
                    )}
                  </Box>
                </Alert>
              )}

              {/* Loading especial para reintento de consulta */}
              {loading && procesando && datosPasos?.enviar?.completado && !datosPasos?.consultar?.completado && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress 
                      size={16} 
                      thickness={4} 
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? 'warning.light' : 'warning.main'
                      }} 
                    />
                    Reintentando Consulta...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verificando nuevamente el estado del comprobante en SUNAT
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {/* Error específico para código 99 - Mostrar después del paso 4 */}
          {tieneErrorEspecifico() && (
            <Box sx={{ mb: 2 }}>
              <Alert
                severity="error"
                sx={{
                  mb: 1.5,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography
                  variant={isMobile ? "body2" : "subtitle2"}
                  sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Error color="error" />
                  Error Específico de SUNAT (Código 99)
                </Typography>

                {/* Mostrar códigos de forma destacada */}
                <Box sx={{
                  mt: 1,
                  mb: 1,
                  p: 1.5,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'error.dark' : 'error.light',
                  borderRadius: 1,
                  color: 'error.contrastText'
                }}>
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Assignment fontSize="small" />
                    Códigos de Error:
                  </Typography>

                  {datosPasos?.consultar?.datos?.estadoSunat && (
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', ml: 1 }}
                    >
                      • <strong>Estado SUNAT:</strong> {datosPasos.consultar.datos.estadoSunat}
                    </Typography>
                  )}

                  {(datosPasos?.consultar?.datos?.codigoError || datosPasos?.consultar?.datos?.error?.match(/\d{4}/)) && (
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', ml: 1 }}
                    >
                      • <strong>Código de Error:</strong> {
                        datosPasos.consultar.datos?.codigoError ||
                        datosPasos.consultar.datos?.error?.match(/\d{4}/)?.[0] ||
                        'No disponible'
                      }
                    </Typography>
                  )}

                  {datosPasos?.consultar?.datos?.ticket && (
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', ml: 1 }}
                    >
                      • <strong>Ticket:</strong> {datosPasos.consultar.datos.ticket}
                    </Typography>
                  )}
                </Box>
              </Alert>

              {/* Detalle del error en una caja separada */}
              <Box sx={{
                p: 2,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.main',
                mb: 1.5
              }}>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  sx={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: 'medium',
                    mb: 1,
                    color: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <Assignment fontSize="small" />
                  Detalle del Error:
                </Typography>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  sx={{
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    fontFamily: 'monospace',
                    wordBreak: 'break-word',
                    color: 'text.primary',
                    lineHeight: 1.4
                  }}
                >
                  {datosPasos?.consultar?.datos?.error || 'Error no especificado'}
                </Typography>
              </Box>

              {/* Mensaje de acción requerida */}
              <Alert
                severity="warning"
                sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.light',
                  color: 'warning.contrastText'
                }}
              >
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  sx={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.5
                  }}
                >
                  <Warning fontSize="small" color="warning" sx={{ mt: 0.1 }} />
                  <span><strong>Acción requerida:</strong> Este error requiere corrección en los datos de la guía.
                    Use "Seguir Editando" para revisar y corregir la información según el detalle del error mostrado arriba.</span>
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          {completado ? (
            <Button
              onClick={handleClose}
              variant="contained"
              color="success"
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
              sx={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                py: isMobile ? 1.5 : 1,
                position: 'relative'
              }}
            >
              <CheckCircle sx={{ mr: 1 }} />
              Cerrar
              {/* Indicador sutil de que ejecutará onSuccess */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.65rem',
                  color: 'success.light',
                  opacity: 0.8
                }}
              >
                {(resultadoLocal || resultado) ? 'Finalizar proceso' : ''}
              </Typography>
            </Button>
          ) : procesoFallido ? (
            <Box sx={{
              display: 'flex',
              gap: 1,
              width: isMobile ? '100%' : 'auto',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              {/* Solo mostrar botón de reintentar proceso completo si NO es código 99 */}
              {!tieneErrorEspecifico() && (
                <Button
                  onClick={() => {
                    setProcesoFallido(false);
                    handleProcesar();
                  }}
                  variant="contained"
                  color="primary"
                  size={isMobile ? "medium" : "large"}
                  fullWidth={isMobile}
                  sx={{
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    py: isMobile ? 1.5 : 1
                  }}
                >
                  <Refresh sx={{ mr: 1 }} />
                  Reintentar Proceso Completo
                </Button>
              )}

              <Button
                onClick={handleClose}
                variant="outlined"
                color={getColorBotonCierre()}
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                disabled={isBotonCierreDeshabilitado()}
                sx={{
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  py: isMobile ? 1.5 : 1,
                  opacity: isBotonCierreDeshabilitado() ? 0.5 : 1
                }}
              >
                {getTextoBotonCierre()}
              </Button>
            </Box>
          ) : (
            <Button
              onClick={handleClose}
              disabled={isBotonCierreDeshabilitado()}
              variant="outlined"
              color={getColorBotonCierre()}
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
              sx={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                py: isMobile ? 1.5 : 1,
                opacity: isBotonCierreDeshabilitado() ? 0.5 : 1
              }}
            >
              {getTextoBotonCierre()}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Backdrop adicional para prevenir clicks */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ...(isMobile && {
            position: 'fixed'
          })
        }}
        open={loading}
      >
        <Box sx={{
          textAlign: 'center',
          px: isMobile ? 2 : 0
        }}>
          <CircularProgress
            color="inherit"
            size={isMobile ? 50 : 60}
          />
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              mt: 2,
              fontSize: isMobile ? '0.875rem' : '1.25rem',
              maxWidth: isMobile ? '80vw' : 'none',
              wordBreak: 'break-word'
            }}
          >
            {progress}
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};
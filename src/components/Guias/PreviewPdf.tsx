import { Modal, Box, Typography, useMediaQuery, Theme } from "@mui/material";
import { memo, useEffect, useState, useRef, useCallback } from "react";
import { GuiaServices } from "../../service/GuiaServices";

interface PreviewPdfProps {
  openPdf: boolean;
  idGuia: number;
  handleClosePdf?: () => void;
}

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

const PreviewPdf = memo(({ openPdf, idGuia, handleClosePdf }: PreviewPdfProps) => {
  const [base64Pdf, setBase64Pdf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  // Ref para controlar la petición activa
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastIdGuiaRef = useRef<number | null>(null);

  const FormatedGuia = useCallback((guia: any) => {
    let vehiculos = guia.envio.vehiculo?.length > 0 ? guia.envio.vehiculo?.find(ve => ve.tipo === 'P') : null;
    let secundarios = guia.envio.vehiculo?.length > 0 ? guia.envio.vehiculo?.filter(ve => ve.tipo === 'S') : [];

    if (vehiculos) {
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
    };

    return doc;
  }, []);

  const openMobilPdf = useCallback(() => {
    if (isMobile && base64Pdf) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64Pdf}`;
      link.download = `Guia_${idGuia}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cerrar el modal después de descargar en móvil
      if (handleClosePdf) {
        handleClosePdf();
      }
    }
  }, [isMobile, base64Pdf, idGuia, handleClosePdf]);

  useEffect(() => {
    const getGuiaAndPdf = async () => {
      // Si el modal no está abierto o no hay ID, limpiar estado
      if (!openPdf || !idGuia) {
        setBase64Pdf('');
        setError(null);
        return;
      }

      // Si es el mismo ID que ya se procesó, no hacer nada
      if (lastIdGuiaRef.current === idGuia && base64Pdf) {
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);
      setBase64Pdf(''); // Limpiar PDF anterior solo cuando iniciamos nueva carga

      try {
        const response = await GuiaServices.getPdfById(idGuia);
        
        // Verificar si la petición fue cancelada
        if (abortController.signal.aborted) {
          return;
        }

        const guia = response.data;

        if (guia) {
          const GuiaFormateada = FormatedGuia(guia);
          const responsePdf = await GuiaServices.getPdf(GuiaFormateada);
          
          // Verificar nuevamente si fue cancelada
          if (abortController.signal.aborted) {
            return;
          }

          if (responsePdf.response && responsePdf.response.TramaPdf) {
            setBase64Pdf(responsePdf.response.TramaPdf);
            lastIdGuiaRef.current = idGuia; // Guardar el último ID procesado exitosamente
          } else {
            setError("No se pudo generar el PDF");
          }
        } else {
          setError("No se encontró la guía");
        }
      } catch (error: any) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching PDF:", error);
          setError("Error al cargar el PDF");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getGuiaAndPdf();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [idGuia, openPdf, FormatedGuia, base64Pdf]);

  // Effect para abrir automáticamente en móvil cuando el PDF esté listo
  useEffect(() => {
    if (base64Pdf && isMobile && !loading && !error) {
      // Usar setTimeout para asegurar que el PDF se haya establecido completamente
      const timer = setTimeout(() => {
        openMobilPdf();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [base64Pdf, isMobile, loading, error, openMobilPdf]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!openPdf) {
      setBase64Pdf('');
      setError(null);
      lastIdGuiaRef.current = null;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [openPdf]);

  const handleClose = useCallback(() => {
    if (handleClosePdf) {
      handleClosePdf();
    }
  }, [handleClosePdf]);

  return (
    <Modal
      open={openPdf}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={stylePdf}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Visor de Pdf
        </Typography>
        {loading ? (
          <Typography textAlign={'center'} variant="body1">
            {isMobile ? 'Preparando descarga...' : 'Cargando PDF...'}
          </Typography>
        ) : error ? (
          <Typography textAlign={'center'} variant="body1" color="error">
            {error}
          </Typography>
        ) : isMobile ? (
          <Typography textAlign={'center'} variant="body1">
            {base64Pdf ? 'Descarga iniciada automáticamente' : 'Preparando PDF para descarga...'}
          </Typography>
        ) : base64Pdf ? (
          <Box 
            sx={{ width: '100%', height: '70vh' }} 
            component={'embed'} 
            src={`data:application/pdf;base64,${base64Pdf}`} 
          />
        ) : (
          <Typography textAlign={'center'} variant="body1">
            Selecciona una guía para ver el PDF
          </Typography>
        )}
      </Box>
    </Modal>
  );
});

PreviewPdf.displayName = 'PreviewPdf';

export default PreviewPdf;
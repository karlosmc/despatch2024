import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  Divider,
  Chip,
  Alert,
  Snackbar,
  Skeleton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Formik, Form } from 'formik';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Importar componentes existentes
import PersonaCliente from '../PersonaCliente';
import DatosEnvioForm from '../DatosEnvioForm';
import Direccion from '../Direccion';
import DatosTransportista from '../DatosTransportista';
import DatosVehiculos from '../DatosVehiculos';
import DocumentosDetalles from '../DocumentosDetalles';
import DocumentosAdicionales from '../DocumentosAdicionales';
import Observaciones from '../Observaciones';

// Importar servicios y tipos
import { GuiaRemision } from '../../types/guias/guiaremision.interface';
import { GuiaServices } from '../../service/GuiaServices';

// Importar modales de acciones
import ProcesarGuiaModal from './components/ProcesarGuiaModal';
import PreviewGuiaModal from './components/PreviewGuiaModal';

interface GuiaRemisionEditSimpleProps {}

const GuiaRemisionEditSimple: React.FC<GuiaRemisionEditSimpleProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<GuiaRemision | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<{ [key: string]: boolean }>({
    destinatario: true,
    envio: false,
    direcciones: false,
    transporte: false,
    productos: false,
    documentos: false,
    observaciones: false
  });
  
  // Estados para modales
  const [showProcesarModal, setShowProcesarModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Estados para notificaciones
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Cargar datos originales
  useEffect(() => {
    const loadGuiaData = async () => {
      if (!id) {
        setNotification({
          open: true,
          message: 'ID de guía no proporcionado',
          severity: 'error'
        });
        navigate('/admin/guiaremision');
        return;
      }

      try {
        setLoading(true);
        const response = await GuiaServices.get(parseInt(id));
        
        if (response) {
          setOriginalData(response);
        } else {
          throw new Error('No se encontró la guía');
        }
      } catch (error) {
        console.error('Error al cargar la guía:', error);
        setNotification({
          open: true,
          message: 'Error al cargar los datos de la guía',
          severity: 'error'
        });
        navigate('/admin/guiaremision');
      } finally {
        setLoading(false);
      }
    };

    loadGuiaData();
  }, [id, navigate]);

  // Valores iniciales para edición - SIN datosGenerales
  const getInitialValues = (): Partial<GuiaRemision> => ({
    // Mapear campos del API (raíz) a la estructura de la interfaz (datosGenerales)
    datosGenerales: {
      correlativo: (originalData as any)?.correlativo || "0",
      fechaEmision: (originalData as any)?.fechaEmision || dayjs().format("YYYY-MM-DD"),
      serie: (originalData as any)?.serie || "",
      tipoDoc: (originalData as any)?.tipoDoc || "09",
      version: (originalData as any)?.version || "2.0",
    },
    destinatario: originalData?.destinatario || {
      id: 0,
      numDoc: "",
      rznSocial: "",
      tipoDoc: "6",
    },
    tercero: originalData?.tercero || {
      id: 0,
      numDoc: "",
      rznSocial: "",
      tipoDoc: "6",
    },
    envio: originalData?.envio || {
      codTraslado: "",
      desTraslado: "",
      fecTraslado: dayjs().format("YYYY-MM-DD"),
      indicadores: [],
      indTransbordo: "",
      modTraslado: "02",
      numBultos: 0,
      pesoTotal: 1,
      undPesoTotal: "KGM",
    },
    addDocs: originalData?.addDocs || [],
    details: originalData?.details || [],
    choferes: originalData?.choferes || [],
    vehiculo: originalData?.vehiculo || {
      id: 0,
      placa: "",
      codEmisor: "",
      nroAutorizacion: "",
      nroCirculacion: "",
      secundarios: [],
    },
    partida: originalData?.partida || {
      id: 0,
      codLocal: "0000",
      direccion: "",
      ruc: "",
      ubigeo: "",
      rznSocial: '',
    },
    llegada: originalData?.llegada || {
      id: 0,
      codLocal: "0000",
      direccion: "",
      ruc: "",
      ubigeo: "",
      rznSocial: ''
    },
    transportista: originalData?.transportista || {
      id: 0,
      nroMtc: "",
      numDoc: "",
      rznSocial: "",
      tipoDoc: "6",
    },
    observacion: originalData?.observacion || ''
  });

  // Manejar expansión de acordeones
  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  // Guardar cambios
  const handleSave = async (values: Partial<GuiaRemision>) => {
    if (!id || !originalData) return;

    try {
      setSaving(true);
      
      // Transformar datos para envío al API - extraer datosGenerales a campos raíz
      const updatedData = {
        // Campos de datosGenerales van en la raíz (formato que espera el API)
        serie: values.datosGenerales?.serie || (originalData as any).serie,
        correlativo: values.datosGenerales?.correlativo || (originalData as any).correlativo,
        fechaEmision: values.datosGenerales?.fechaEmision || (originalData as any).fechaEmision,
        tipoDoc: values.datosGenerales?.tipoDoc || (originalData as any).tipoDoc,
        version: values.datosGenerales?.version || (originalData as any).version,
        
        // Resto de campos normales
        destinatario: values.destinatario || originalData.destinatario,
        tercero: values.tercero || originalData.tercero,
        envio: values.envio || originalData.envio,
        partida: values.partida || originalData.partida,
        llegada: values.llegada || originalData.llegada,
        transportista: values.transportista || originalData.transportista,
        vehiculo: values.vehiculo || originalData.vehiculo,
        choferes: values.choferes || originalData.choferes,
        observacion: values.observacion || originalData.observacion,
        addDocs: values.addDocs || originalData.addDocs,
        details: values.details || originalData.details,
        
        // Mantener el ID
        id: parseInt(id)
      };

      const response = await GuiaServices.update(updatedData, parseInt(id));
      
      if (response) {
        setNotification({
          open: true,
          message: 'Guía actualizada correctamente',
          severity: 'success'
        });
        
        // Actualizar datos originales
        setOriginalData(updatedData as any);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setNotification({
        open: true,
        message: 'Error al guardar los cambios',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    navigate('/admin/guiaremision');
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} />
        </Paper>
      </Box>
    );
  }

  if (!originalData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No se pudo cargar la información de la guía
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Guía de Remisión
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`ID: ${id}`} color="primary" variant="outlined" />
          {(originalData as any)?.serie && (originalData as any)?.correlativo && (
            <Chip 
              label={`${(originalData as any).serie}-${(originalData as any).correlativo}`} 
              color="secondary" 
              variant="outlined" 
            />
          )}
        </Box>

        <Formik
          initialValues={getInitialValues()}
          onSubmit={handleSave}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              {/* Destinatario */}
              <Accordion 
                expanded={expandedAccordions.destinatario} 
                onChange={handleAccordionChange('destinatario')}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Destinatario</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <PersonaCliente 
                        initialValue={values.destinatario || {
                          id: 0,
                          numDoc: "",
                          rznSocial: "",
                          tipoDoc: "6",
                        }}
                        onChange={(persona) => setFieldValue('destinatario', persona)}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Datos de Envío */}
              <Accordion 
                expanded={expandedAccordions.envio} 
                onChange={handleAccordionChange('envio')}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Datos de Envío</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DatosEnvioForm 
                    EnvioValues={values.envio || {
                      codTraslado: "",
                      desTraslado: "",
                      fecTraslado: dayjs().format("YYYY-MM-DD"),
                      indicadores: [],
                      indTransbordo: "",
                      modTraslado: "02",
                      numBultos: 0,
                      pesoTotal: 1,
                      undPesoTotal: "KGM",
                    }}
                    onChange={(envio) => setFieldValue('envio', envio)}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Direcciones */}
              <Accordion 
                expanded={expandedAccordions.direcciones} 
                onChange={handleAccordionChange('direcciones')}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Direcciones</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Punto de Partida
                      </Typography>
                      <Direccion 
                        initialValue={values.partida || {
                          id: 0,
                          codLocal: "0000",
                          direccion: "",
                          ruc: "",
                          ubigeo: "",
                          rznSocial: '',
                        }}
                        onChange={(direccion) => setFieldValue('partida', direccion)}
                        codTraslado={values.envio?.codTraslado || ""}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Punto de Llegada
                      </Typography>
                      <Direccion 
                        initialValue={values.llegada || {
                          id: 0,
                          codLocal: "0000",
                          direccion: "",
                          ruc: "",
                          ubigeo: "",
                          rznSocial: ''
                        }}
                        onChange={(direccion) => setFieldValue('llegada', direccion)}
                        codTraslado={values.envio?.codTraslado || ""}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Transporte */}
              <Accordion 
                expanded={expandedAccordions.transporte} 
                onChange={handleAccordionChange('transporte')}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Datos de Transporte</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <DatosTransportista 
                        initialValue={values.transportista || {
                          id: 0,
                          nroMtc: "",
                          numDoc: "",
                          rznSocial: "",
                          tipoDoc: "6",
                        }}
                        onChange={(transportista) => setFieldValue('transportista', transportista)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <DatosVehiculos 
                        initialValue={values.vehiculo || {
                          id: 0,
                          placa: "",
                          codEmisor: "",
                          nroAutorizacion: "",
                          nroCirculacion: "",
                          secundarios: [],
                        }}
                        onChange={(vehiculo) => setFieldValue('vehiculo', vehiculo)}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Productos/Detalles */}
              <Accordion 
                expanded={expandedAccordions.productos} 
                onChange={handleAccordionChange('productos')}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Productos</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DocumentosDetalles 
                    detalles={values.details || []}
                    onDelete={(item) => {
                      const newDetails = values.details?.filter(d => d !== item) || [];
                      setFieldValue('details', newDetails);
                    }}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Documentos Adicionales */}
              <Accordion 
                expanded={expandedAccordions.documentos} 
                onChange={handleAccordionChange('documentos')}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Documentos Adicionales</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DocumentosAdicionales 
                    adicionales={values.addDocs || []}
                    onDelete={(item) => {
                      const newAddDocs = values.addDocs?.filter(d => d !== item) || [];
                      setFieldValue('addDocs', newAddDocs);
                    }}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Observaciones */}
              <Accordion 
                expanded={expandedAccordions.observaciones} 
                onChange={handleAccordionChange('observaciones')}
                sx={{ mb: 3 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Observaciones</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Observaciones 
                    observaciones={values.observacion || ''}
                    onChange={(observacion) => setFieldValue('observacion', observacion)}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Acciones */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 3, 
                pt: 2, 
                borderTop: '1px solid #e0e0e0' 
              }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving || isSubmitting}
                  size="large"
                >
                  Cancelar
                </Button>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreviewModal(true)}
                    disabled={saving || isSubmitting}
                  >
                    Vista Previa
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => setShowProcesarModal(true)}
                    disabled={saving || isSubmitting}
                  >
                    Procesar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || isSubmitting}
                    size="large"
                  >
                    {saving || isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      {/* Modales */}
      <ProcesarGuiaModal
        open={showProcesarModal}
        onClose={() => {
          setNotification({
            open: true,
            message: 'Guía procesada correctamente',
            severity: 'success'
          });
          setShowProcesarModal(false);
        }}
      />

      <PreviewGuiaModal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        guiaData={originalData}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GuiaRemisionEditSimple;

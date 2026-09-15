import React, { useEffect, useState } from "react";
import {
  AddDoc,
  Client,
  DatosGenerales,
  Detail,
  Direccion as DireccionType,
  Envio,
  EnvioChoferes,
  EnvioTransportista,
  EnvioVehiculo,
  GuiaRemision,
} from "../../types/guias/guiaremision.interface";
import dayjs from "dayjs";
import { useNotification } from "../../context/notification.context";
import { useFormik } from "formik";
import {
  GuiaRemisionSchema
} from "../../utils/validateGuiaRemision";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  Chip,
  Divider,
} from "@mui/material";

import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import PinDropIcon from "@mui/icons-material/PinDrop";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Componentes importados (reutilizando los existentes)
import DatosGeneralesForm from "../DatosGeneralesForm";
import PersonaCliente from "../PersonaCliente";
import DatosEnvioForm from "../DatosEnvioForm";
import DocumentosDetalles from "../DocumentosDetalles";
import DireccionComponent from "../Direccion";
import DatosTransportista from "../DatosTransportista";
import DatosVehiculos from "../DatosVehiculos";
import Conductores from "../Conductores";

// Servicios y contextos
import { GuiaServices } from "../../service/GuiaServices";
import { useAuthStore } from "../../store/authStore";
import { useParams, useNavigate } from "react-router-dom";

// Modales reutilizados
import { DialogComponentCustom } from "../../components";

interface GuiaRemisionEditProps {
  guiaId?: string;
}

const GuiaRemisionEdit: React.FC<GuiaRemisionEditProps> = ({ guiaId: propGuiaId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guiaId = propGuiaId || paramId;
  
  const { getError, getSuccess } = useNotification();
  const { user } = useAuthStore();

  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<GuiaRemision | null>(null);
  const [expanded, setExpanded] = useState<string>('datos-generales');
  
  // Estados de modales
  const [modals, setModals] = useState({
    tercero: false,
    destinatario: false,
    partida: false,
    llegada: false,
    transportista: false,
    vehiculo: false,
    conductores: false,
    detalles: false
  });

  // Datos adicionales
  const [additionalData, setAdditionalData] = useState({
    adicionalDocs: [] as AddDoc[],
    detalles: [] as Detail[],
    base64Pdf: '',
    datosParaProcesar: null,
    estadoElectronico: null
  });

  // Valores iniciales para edición - Adaptable a diferentes estructuras
  const getInitialValues = (): GuiaRemision => ({
    // Datos generales - el API devuelve estos campos en la raíz
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

  // Formik setup
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await handleUpdate(values);
    },
  });

  // Cargar datos de la guía para edición
  useEffect(() => {
    const loadGuiaData = async () => {
      if (!guiaId || !user) return;
      
      setLoading(true);
      try {
        const response = await GuiaServices.get(parseInt(guiaId)); // Corregido método
        
        if (response.data) {
          const guiaData = response.data;
          
          // Establecer los datos originales
          setOriginalData(guiaData);
          
          
          // Configurar formik con los datos cargados - mapear estructura del API
          formik.setValues({
            // Crear estructura datosGenerales desde campos raíz del API
            
            datosGenerales: {
              correlativo: (guiaData as any).correlativo || "0",
              fechaEmision: dayjs((guiaData as any).fechaEmision).format("YYYY-MM-DD"),
              serie: (guiaData as any).serie || "",
              tipoDoc: (guiaData as any).tipoDoc || "09",
              version: (guiaData as any).version || "2.0",
            },
            // Resto de campos del API
            destinatario: guiaData.destinatario,
            tercero: guiaData.tercero,
            envio: {
              ...guiaData.envio,
              fecTraslado: dayjs(guiaData.envio.fecTraslado).format("YYYY-MM-DD"),
            },
            addDocs: guiaData.addDocs || [],
            details: guiaData.details || [],
            choferes: guiaData.envio.choferes || [],
            vehiculo: guiaData.envio.vehiculo,
            partida: guiaData.envio.partida,
            llegada: guiaData.envio.llegada,
            transportista: guiaData.envio.transportista,
            observacion: guiaData.observacion || ''
          });
          
          // Configurar datos adicionales
          setAdditionalData({
            adicionalDocs: guiaData.addDocs || [],
            detalles: guiaData.details || [],
            base64Pdf: '',
            datosParaProcesar: null,
            estadoElectronico: null // Simplificado
          });
          
          // Mensaje usando campos directos del API
          getSuccess(`Guía ${(guiaData as any).serie}-${(guiaData as any).correlativo} cargada para edición`);
        }
      } catch (error) {
        console.error('Error loading guia:', error);
        getError('Error al cargar los datos de la guía');
        navigate('/admin/guias');
      } finally {
        setLoading(false);
      }
    };

    loadGuiaData();
  }, [guiaId, user]);

  // Cargar puntos de emisión (simplificado)
  useEffect(() => {
    // Simplificado para el componente de edición
    console.log('Component loaded for editing');
  }, [user]);

  useEffect(() => {
    // Simplificado para el componente de edición
    if(formik.values){
      console.log(formik.values);
    }
  }, [formik.values]);

  // Manejar actualización
  const handleUpdate = async (values: GuiaRemision) => {
    if (!guiaId) return;
    
    setSaving(true);
    try {
      // Preparar documento para envío - transformar datosGenerales a campos raíz
      const doc = {
        // Extraer campos de datosGenerales y ponerlos en la raíz (formato que espera el API)
        serie: values.datosGenerales.serie,
        correlativo: values.datosGenerales.correlativo,
        fechaEmision: values.datosGenerales.fechaEmision,
        tipoDoc: values.datosGenerales.tipoDoc,
        version: values.datosGenerales.version,
        
        // Resto de campos normales
        destinatario: values.destinatario,
        tercero: values.tercero,
        envio: values.envio,
        partida: values.partida,
        llegada: values.llegada,
        transportista: values.transportista,
        vehiculo: values.vehiculo,
        choferes: values.choferes,
        observacion: values.observacion,
        
        // Documentos adicionales y detalles
        addDocs: additionalData.adicionalDocs,
        details: additionalData.detalles,
      };

      const response = await GuiaServices.update(doc, parseInt(guiaId));
      
      if (response) {
        getSuccess('Guía actualizada correctamente');
        // Actualizar datos originales con la nueva estructura
        setOriginalData({ ...doc } as any);
        // Opcional: regresar a la lista
        // navigate('/admin/guias');
      } else {
        getError('Error al actualizar la guía');
      }
    } catch (error) {
      console.error('Error updating guia:', error);
      getError('Error inesperado al actualizar la guía');
    } finally {
      setSaving(false);
    }
  };

  // Funciones de manejo de modales
  const toggleModal = (modalName: keyof typeof modals, value?: boolean) => {
    setModals(prev => ({
      ...prev,
      [modalName]: value !== undefined ? value : !prev[modalName]
    }));
  };

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : '');
  };

  // Verificar si hay cambios sin guardar
  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formik.values) !== JSON.stringify(originalData) ||
           JSON.stringify(additionalData.adicionalDocs) !== JSON.stringify(originalData.addDocs) ||
           JSON.stringify(additionalData.detalles) !== JSON.stringify(originalData.details);
  };

  // Funciones de manejo para cada sección (simplificadas para edición)
  const handleDatosGeneralesChange = (datosGenerales: DatosGenerales) => {
    formik.setFieldValue("datosGenerales", datosGenerales);
  };

  const handleDestinatarioChange = (destinatario: Client) => {
    formik.setFieldValue("destinatario", destinatario);
    toggleModal('destinatario', false);
  };

  const handleTerceroChange = (tercero: Client) => {
    formik.setFieldValue("tercero", tercero);
    toggleModal('tercero', false);
  };

  const handleEnvioChange = (envio: Envio) => {
    formik.setFieldValue("envio", envio);
  };

  const handlePartidaChange = (partida: DireccionType) => {
    formik.setFieldValue("partida", partida);
    toggleModal('partida', false);
  };

  const handleLlegadaChange = (llegada: DireccionType) => {
    formik.setFieldValue("llegada", llegada);
    toggleModal('llegada', false);
  };

  const handleTransportistaChange = (transportista: EnvioTransportista) => {
    formik.setFieldValue("transportista", transportista);
    toggleModal('transportista', false);
  };

  const handleVehiculoChange = (vehiculo: EnvioVehiculo) => {
    formik.setFieldValue("vehiculo", vehiculo);
    toggleModal('vehiculo', false);
  };

  const handleChoferesChange = (choferes: EnvioChoferes[]) => {
    formik.setFieldValue("choferes", choferes);
    toggleModal('conductores', false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6">Cargando datos de la guía...</Typography>
        </Box>
      </Container>
    );
  }

  if (!originalData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No se pudieron cargar los datos de la guía
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header con información de la guía */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom color="primary">
              <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Editar Guía de Remisión
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip 
                label={`${(originalData as any).serie}-${(originalData as any).correlativo}`}
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Fecha: ${dayjs((originalData as any).fechaEmision).format('DD/MM/YYYY')}`}
                color="info" 
                variant="outlined" 
              />
              {additionalData.estadoElectronico && (
                <Chip 
                  label={additionalData.estadoElectronico}
                  color="success" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/guias')}
              disabled={saving}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => formik.handleSubmit()}
              disabled={saving || !hasUnsavedChanges()}
              color="primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Box>
        
        {hasUnsavedChanges() && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Tienes cambios sin guardar
          </Alert>
        )}
      </Paper>

      {/* Formulario de edición con acordeones */}
      <Paper elevation={1}>
        {/* Datos Generales */}
        <Accordion 
          expanded={expanded === 'datos-generales'} 
          onChange={handleAccordionChange('datos-generales')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Datos Generales</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <DatosGeneralesForm
              onChange={handleDatosGeneralesChange}
              datosGeneralesValues={formik.values.datosGenerales}
              onSelectSerie={() => {}} // Simplificado para edición
              puntoEmision={0} // Simplificado
            />
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Destinatario */}
        <Accordion 
          expanded={expanded === 'destinatario'} 
          onChange={handleAccordionChange('destinatario')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <PersonPinCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Destinatario</Typography>
              {formik.values.destinatario.rznSocial && (
                <Chip 
                  label={formik.values.destinatario.rznSocial} 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => toggleModal('destinatario', true)}
              fullWidth
            >
              Editar Destinatario
            </Button>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Datos de Envío */}
        <Accordion 
          expanded={expanded === 'envio'} 
          onChange={handleAccordionChange('envio')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <DeliveryDiningIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Datos de Envío</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <DatosEnvioForm
              onChange={handleEnvioChange}
              EnvioValues={formik.values.envio}
            />
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Direcciones */}
        <Accordion 
          expanded={expanded === 'direcciones'} 
          onChange={handleAccordionChange('direcciones')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <PinDropIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Direcciones</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => toggleModal('partida', true)}
                  fullWidth
                >
                  Editar Punto de Partida
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => toggleModal('llegada', true)}
                  fullWidth
                >
                  Editar Punto de Llegada
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Transporte */}
        <Accordion 
          expanded={expanded === 'transporte'} 
          onChange={handleAccordionChange('transporte')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <AssignmentIndIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Transporte</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => toggleModal('transportista', true)}
                  fullWidth
                >
                  Transportista
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => toggleModal('vehiculo', true)}
                  fullWidth
                >
                  Vehículo
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => toggleModal('conductores', true)}
                  fullWidth
                >
                  Conductores
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Productos */}
        <Accordion 
          expanded={expanded === 'productos'} 
          onChange={handleAccordionChange('productos')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Productos</Typography>
              <Chip 
                label={`${additionalData.detalles.length} items`} 
                size="small" 
                sx={{ ml: 2 }} 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => toggleModal('detalles', true)}
              fullWidth
            >
              Gestionar Productos
            </Button>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Modales */}
      <DialogComponentCustom
        open={modals.destinatario}
        title="Editar Destinatario"
        element={
          <PersonaCliente
            onChange={handleDestinatarioChange}
            initialValue={formik.values.destinatario}
            tipo={formik.values.envio.codTraslado === '02' || formik.values.envio.codTraslado === '04' ? 'default' : ''}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('destinatario', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.tercero}
        title="Editar Tercero"
        element={
          <PersonaCliente
            onChange={handleTerceroChange}
            initialValue={formik.values.tercero}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('tercero', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.partida}
        title="Editar Punto de Partida"
        element={
          <DireccionComponent
            onChange={handlePartidaChange}
            initialValue={formik.values.partida}
            codTraslado={formik.values.envio.codTraslado}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('partida', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.llegada}
        title="Editar Punto de Llegada"
        element={
          <DireccionComponent
            onChange={handleLlegadaChange}
            initialValue={formik.values.llegada}
            codTraslado={formik.values.envio.codTraslado}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('llegada', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.transportista}
        title="Editar Transportista"
        element={
          <DatosTransportista
            onChange={handleTransportistaChange}
            initialValue={formik.values.transportista}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('transportista', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.vehiculo}
        title="Editar Vehículo"
        element={
          <DatosVehiculos
            onChange={handleVehiculoChange}
            initialValue={formik.values.vehiculo}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('vehiculo', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.conductores}
        title="Gestionar Conductores"
        element={
          <Conductores
            choferes={formik.values.choferes}
            onConfirm={handleChoferesChange}
          />
        }
        closeButton={
          <Button onClick={() => toggleModal('conductores', false)}>Cerrar</Button>
        }
      />

      <DialogComponentCustom
        open={modals.detalles}
        title="Gestionar Productos"
        element={
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Productos actuales: {additionalData.detalles.length}
            </Typography>
            <DocumentosDetalles
              detalles={additionalData.detalles}
              onDelete={(detail: Detail) => {
                setAdditionalData(prev => ({
                  ...prev,
                  detalles: prev.detalles.filter(d => d !== detail)
                }));
              }}
            />
          </Box>
        }
        closeButton={
          <Button onClick={() => toggleModal('detalles', false)}>Cerrar</Button>
        }
      />
    </Container>
  );
};

export default GuiaRemisionEdit;

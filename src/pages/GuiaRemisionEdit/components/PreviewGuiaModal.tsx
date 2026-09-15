import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { GuiaRemision } from '../../../types/guias/guiaremision.interface';
import dayjs from 'dayjs';

interface PreviewGuiaModalProps {
  open: boolean;
  onClose: () => void;
  guiaData: GuiaRemision | null;
  additionalData?: any;
}

const PreviewGuiaModal: React.FC<PreviewGuiaModalProps> = ({
  open,
  onClose,
  guiaData,
  additionalData
}) => {
  if (!guiaData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Vista Previa - Guía {guiaData.datosGenerales.serie}-{guiaData.datosGenerales.correlativo}
      </DialogTitle>
      <DialogContent>
        <Box py={2}>
          {/* Datos Generales */}
          <Typography variant="h6" gutterBottom color="primary">
            Datos Generales
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Serie-Correlativo</Typography>
              <Typography variant="body1">{guiaData.datosGenerales.serie}-{guiaData.datosGenerales.correlativo}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Fecha Emisión</Typography>
              <Typography variant="body1">{dayjs(guiaData.datosGenerales.fechaEmision).format('DD/MM/YYYY')}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Destinatario */}
          <Typography variant="h6" gutterBottom color="primary">
            Destinatario
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Razón Social</Typography>
              <Typography variant="body1">{guiaData.destinatario.rznSocial}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Documento</Typography>
              <Typography variant="body1">{guiaData.destinatario.numDoc}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Envío */}
          <Typography variant="h6" gutterBottom color="primary">
            Datos de Envío
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Motivo Traslado</Typography>
              <Typography variant="body1">{guiaData.envio.desTraslado}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Fecha Traslado</Typography>
              <Typography variant="body1">{dayjs(guiaData.envio.fecTraslado).format('DD/MM/YYYY')}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Peso Total</Typography>
              <Typography variant="body1">{guiaData.envio.pesoTotal} {guiaData.envio.undPesoTotal}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Direcciones */}
          <Typography variant="h6" gutterBottom color="primary">
            Direcciones
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Punto de Partida</Typography>
              <Typography variant="body1">{guiaData.partida.direccion}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Punto de Llegada</Typography>
              <Typography variant="body1">{guiaData.llegada.direccion}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Transporte */}
          <Typography variant="h6" gutterBottom color="primary">
            Transporte
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Transportista</Typography>
              <Typography variant="body1">{guiaData.transportista.rznSocial}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Vehículo</Typography>
              <Typography variant="body1">{guiaData.vehiculo.placa}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Conductores</Typography>
              <Box>
                {guiaData.choferes.map((chofer, index) => (
                  <Chip 
                    key={index} 
                    label={chofer.nombres} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Productos */}
          {additionalData?.detalles && additionalData.detalles.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Productos ({additionalData.detalles.length})
              </Typography>
              <Box>
                {additionalData.detalles.slice(0, 3).map((detalle: any, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {detalle.descripcion} - Cantidad: {detalle.cantidad} {detalle.unidad}
                  </Typography>
                ))}
                {additionalData.detalles.length > 3 && (
                  <Typography variant="body2" color="textSecondary">
                    ... y {additionalData.detalles.length - 3} productos más
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewGuiaModal;

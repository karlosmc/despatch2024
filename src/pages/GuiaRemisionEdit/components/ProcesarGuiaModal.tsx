import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

interface ProcesarGuiaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  loading?: boolean;
}

const ProcesarGuiaModal: React.FC<ProcesarGuiaModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Procesar Guía de Remisión
      </DialogTitle>
      <DialogContent>
        <Box textAlign="center" py={3}>
          {loading ? (
            <>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Procesando guía...
              </Typography>
            </>
          ) : (
            <Typography variant="body1">
              ¿Está seguro que desea procesar esta guía de remisión?
              Esta acción enviará la guía a SUNAT.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Procesar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcesarGuiaModal;

import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import { ProcesarGuiaModal } from "../GuiaRemision/ProcesarGuia";
import DesktopForm from "./DesktopForm";
import MobileForm from "./MobileForm";
import { useGuiaRemisionForm } from "./useGuiaRemisionForm";

/**
 * Guía de remisión electrónica (formulario nuevo).
 *
 * Misma lógica de negocio que `pages/GuiaRemision`, reorganizada en:
 *  - `useGuiaRemisionForm`  -> estado, validaciones, guardado y envío
 *  - `MobileForm`           -> asistente por pasos, pensado para el celular
 *  - `DesktopForm`          -> secciones + índice y resumen lateral
 *
 * Agrega el guardado en dos modos: sólo guardar (sin enviar a SUNAT) o
 * guardar y lanzar el proceso electrónico.
 */
const GuiaRemisionNueva = () => {
  const api = useGuiaRemisionForm();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {api.bloqueada && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {api.estadoGuia === "B"
            ? "Esta guía fue dada de baja: sólo puedes consultarla."
            : "Esta guía ya fue aceptada por SUNAT: sólo puedes consultarla."}
        </Alert>
      )}

      {api.isMobile ? <MobileForm api={api} /> : <DesktopForm api={api} />}

      {/* Carga de la guía a editar */}
      <Backdrop open={api.cargando} sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" />
          <Typography variant="body2">Cargando la guía…</Typography>
        </Box>
      </Backdrop>

      {/* Confirmación de salida con cambios sin guardar */}
      <Dialog
        open={api.salidaOpen}
        onClose={api.cancelarSalida}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SaveRoundedIcon color="warning" />
          Tienes cambios sin guardar
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            Si sales ahora se perderá lo que escribiste en esta guía. ¿Quieres guardarla antes de
            salir? Se guardará sin enviarla a SUNAT.
          </DialogContentText>
          <DialogContentText variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
            Para guardar, la guía debe estar completa. Si aún le faltan datos, el sistema te dirá
            qué falta y podrás seguir editando o salir sin guardar.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1, px: 2, pb: 2 }}>
          <Button onClick={api.cancelarSalida} color="inherit">
            Seguir editando
          </Button>
          <Box flex={1} />
          <Button onClick={api.salirSinGuardar} color="error">
            Salir sin guardar
          </Button>
          <Button
            onClick={api.guardarYSalir}
            variant="contained"
            color="success"
            disabled={api.guardando}
          >
            Guardar y salir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vista previa del PDF (escritorio) */}
      <Dialog
        open={api.openPreview}
        onClose={api.cerrarPreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Vista previa</DialogTitle>
        <DialogContent>
          <Box
            component="embed"
            src={`data:application/pdf;base64,${api.base64Pdf}`}
            sx={{ width: "100%", height: "72vh", border: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={api.cerrarPreview}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conductor relacionado al usuario */}
      <Dialog open={api.openConfirmChofer} maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box display="flex" flexDirection="column" alignItems="center">
            <AssignmentIndIcon color="warning" sx={{ fontSize: 64 }} />
            <Typography variant="subtitle2" color="text.secondary" textAlign="center">
              Conductor encontrado
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2">
            El conductor con DNI {api.conductorFound.length > 0 ? api.conductorFound[0].nroDoc : ""}{" "}
            está relacionado al usuario.
          </Typography>
          <Typography variant="body2">
            ¿Deseas asignarlo como conductor principal en esta guía?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={api.cancelarChoferEncontrado} color="inherit">
            Cancelar
          </Button>
          <Button onClick={api.confirmarChoferEncontrado} variant="contained" color="success">
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehículo asociado a la serie */}
      <Dialog open={api.openConfirmVehiculo} maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box display="flex" flexDirection="column" alignItems="center">
            <LocalShippingIcon color="warning" sx={{ fontSize: 64 }} />
            <Typography variant="subtitle2" color="text.secondary" textAlign="center">
              Vehículo encontrado
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2">
            La serie tiene por defecto el vehículo principal con placa {api.vehiculoFound.placa}.
          </Typography>
          {api.vehiculoFound.secundarios?.length > 0 && (
            <Typography variant="body2">
              Y el vehículo secundario con placa {api.vehiculoFound.secundarios[0].placa}.
            </Typography>
          )}
          <Typography variant="body2">¿Deseas asignarlo en la guía?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={api.cancelarVehiculoEncontrado} color="inherit">
            Cancelar
          </Button>
          <Button onClick={api.confirmarVehiculoEncontrado} variant="contained" color="success">
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Proceso electrónico ante SUNAT */}
      <ProcesarGuiaModal
        open={api.modalSunatOpen}
        onClose={api.cerrarModalSunat}
        datosGuia={api.datosParaProcesar}
        onSuccess={api.onProcesoSuccess}
        onError={api.onProcesoError}
        idElectronico={api.estadoElectronico}
      />
    </LocalizationProvider>
  );
};

export default GuiaRemisionNueva;

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import { DetalleConexion, EVENTO_CONEXION } from "../../../api/conexion";
import { EstadoPaso, PasoCarga } from "../useGuiaRapida";

interface CargaInicialProps {
  abierto: boolean;
  pasos: PasoCarga[];
  /** Todo terminó y al menos un paso falló. */
  hayErrores: boolean;
  onReintentar: () => void;
  onSalir: () => void;
}

const SEGUNDOS_LENTO = 12;

const iconoPaso = (estado: EstadoPaso) => {
  switch (estado) {
    case "cargando":
      return <CircularProgress size={14} />;
    case "listo":
      return <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />;
    case "aviso":
      return <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 18 }} />;
    case "error":
      return <ErrorRoundedIcon color="error" sx={{ fontSize: 18 }} />;
    default:
      return <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />;
  }
};

/**
 * Bloquea la pantalla mientras se cargan los datos iniciales. No se cierra con
 * Escape ni tocando afuera: sólo desaparece cuando todo cargó, o se sale con el
 * botón. Si algo falla muestra el motivo de cada paso y deja reintentar.
 */
const CargaInicial = ({ abierto, pasos, hayErrores, onReintentar, onSalir }: CargaInicialProps) => {
  const [segundos, setSegundos] = useState(0);
  const [conexion, setConexion] = useState<string | null>(null);

  /* Contador para avisar cuando tarda más de lo normal. */
  useEffect(() => {
    if (!abierto || hayErrores) {
      setSegundos(0);
      return;
    }
    const inicio = Date.now();
    const temporizador = setInterval(() => setSegundos(Math.floor((Date.now() - inicio) / 1000)), 1000);
    return () => clearInterval(temporizador);
  }, [abierto, hayErrores]);

  /* Explica en vivo si el servidor no responde y se está reintentando. */
  useEffect(() => {
    if (!abierto) return;
    const onConexion = (event: Event) => {
      const detalle = (event as CustomEvent<DetalleConexion>).detail;
      if (detalle.estado === "reintentando") {
        setConexion(`El servidor no responde. Reintentando (${detalle.intento} de ${detalle.maximo})…`);
      } else if (detalle.estado === "caida") {
        setConexion("No hay respuesta del servidor.");
      } else {
        setConexion(null);
      }
    };
    const onOffline = () => setConexion("Sin conexión a internet.");
    const onOnline = () => setConexion(null);

    window.addEventListener(EVENTO_CONEXION, onConexion);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener(EVENTO_CONEXION, onConexion);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [abierto]);

  const terminados = pasos.filter((p) => p.estado === "listo" || p.estado === "aviso").length;
  const progreso = pasos.length ? Math.round((terminados / pasos.length) * 100) : 0;

  return (
    <Dialog
      open={abierto}
      fullWidth
      maxWidth="xs"
      disableEscapeKeyDown
      onClose={() => {
        /* No se cierra tocando afuera: sólo con los botones. */
      }}
      aria-labelledby="carga-inicial-titulo"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent sx={{ pt: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          {hayErrores ? <ErrorRoundedIcon color="error" /> : <CircularProgress size={22} />}
          <Box minWidth={0}>
            <Typography id="carga-inicial-titulo" variant="subtitle2" fontWeight={800}>
              {hayErrores ? "No se pudieron cargar los datos iniciales" : "Cargando datos iniciales…"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hayErrores
                ? "Revisa el motivo de cada paso y vuelve a intentar."
                : "Preparando la guía con tus datos."}
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progreso}
          color={hayErrores ? "error" : "primary"}
          sx={{ height: 5, borderRadius: 3, mb: 1.5 }}
        />

        {pasos.map((paso) => (
          <Box key={paso.id} display="flex" gap={1} py={0.5} alignItems="flex-start">
            <Box sx={{ width: 18, height: 20, display: "grid", placeItems: "center", flexShrink: 0 }}>
              {iconoPaso(paso.estado)}
            </Box>
            <Box minWidth={0}>
              <Typography variant="body2" fontWeight={600}>
                {paso.titulo}
              </Typography>
              {paso.detalle && (
                <Typography
                  variant="caption"
                  display="block"
                  color={paso.estado === "error" ? "error.main" : "warning.main"}
                >
                  {paso.detalle}
                </Typography>
              )}
            </Box>
          </Box>
        ))}

        {conexion && (
          <Typography variant="caption" color="warning.main" display="block" mt={1}>
            {conexion}
          </Typography>
        )}
        {!hayErrores && segundos >= SEGUNDOS_LENTO && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Está tardando más de lo normal ({segundos} s): el servidor responde lento o la conexión es débil.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button color="inherit" onClick={onSalir}>
          {hayErrores ? "Salir" : "Cancelar"}
        </Button>
        {hayErrores && (
          <Button variant="contained" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CargaInicial;

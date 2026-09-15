import { useEffect, useState } from "react";
import { Alert, CircularProgress, Collapse, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { DetalleConexion, EVENTO_CONEXION } from "../../api/conexion";

type TipoAviso = "reintentando" | "caida" | "offline" | "recuperada";

interface Aviso {
  tipo: TipoAviso;
  texto: string;
}

const SEVERIDAD: Record<TipoAviso, "warning" | "error" | "success"> = {
  reintentando: "warning",
  caida: "error",
  offline: "error",
  recuperada: "success",
};

const avisoOffline: Aviso = {
  tipo: "offline",
  texto: "Sin conexión a internet. Lo que guardes no llegará al servidor hasta que vuelva.",
};

/**
 * Muestra el estado de la conexión: reintentos automáticos, caída del
 * servidor, pérdida de internet y recuperación.
 */
const ConexionBanner = () => {
  const [aviso, setAviso] = useState<Aviso | null>(() =>
    typeof navigator !== "undefined" && navigator.onLine === false ? avisoOffline : null
  );

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const mostrar = (nuevo: Aviso, autoOcultar = false) => {
      clearTimeout(temporizador);
      setAviso(nuevo);
      if (autoOcultar) temporizador = setTimeout(() => setAviso(null), 2500);
    };

    const onConexion = (event: Event) => {
      const detalle = (event as CustomEvent<DetalleConexion>).detail;
      if (detalle.estado === "reintentando") {
        mostrar({
          tipo: "reintentando",
          texto: `El servidor no responde. Reintentando (${detalle.intento} de ${detalle.maximo})…`,
        });
      } else if (detalle.estado === "caida") {
        mostrar({
          tipo: "caida",
          texto: "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
        });
      } else {
        mostrar({ tipo: "recuperada", texto: "Conexión restablecida" }, true);
      }
    };

    const onOffline = () => mostrar(avisoOffline);
    const onOnline = () => mostrar({ tipo: "recuperada", texto: "Conexión restablecida" }, true);

    window.addEventListener(EVENTO_CONEXION, onConexion);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      clearTimeout(temporizador);
      window.removeEventListener(EVENTO_CONEXION, onConexion);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const icono =
    aviso?.tipo === "reintentando" ? (
      <CircularProgress size={18} color="inherit" />
    ) : aviso?.tipo === "offline" ? (
      <WifiOffRoundedIcon fontSize="small" />
    ) : aviso?.tipo === "recuperada" ? (
      <CloudDoneRoundedIcon fontSize="small" />
    ) : (
      <ErrorOutlineRoundedIcon fontSize="small" />
    );

  return (
    <Collapse in={Boolean(aviso)} unmountOnExit>
      {aviso && (
        <Alert
          severity={SEVERIDAD[aviso.tipo]}
          icon={icono}
          variant="filled"
          sx={{ mb: 1, borderRadius: 2, alignItems: "center" }}
          action={
            aviso.tipo === "caida" ? (
              <IconButton size="small" color="inherit" onClick={() => setAviso(null)} aria-label="Cerrar aviso">
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            ) : undefined
          }
        >
          {aviso.texto}
        </Alert>
      )}
    </Collapse>
  );
};

export default ConexionBanner;

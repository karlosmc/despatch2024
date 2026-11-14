import { Alert } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import DesktopForm from "./DesktopForm";
import MobileForm from "./MobileForm";
import DialogosGuia from "./components/DialogosGuia";
import ResumenRevision from "./components/ResumenRevision";
import { useGuiaRemisionForm } from "./useGuiaRemisionForm";

/**
 * Guía de remisión electrónica (formulario nuevo).
 *
 * Misma lógica de negocio que `pages/GuiaRemision`, reorganizada en:
 *  - `useGuiaRemisionForm`  -> estado, validaciones, guardado y envío
 *  - `MobileForm`           -> asistente por pasos, pensado para el celular
 *  - `DesktopForm`          -> secciones + índice y resumen lateral
 *  - `DialogosGuia`         -> salida, confirmaciones y envío a SUNAT
 *  - `ResumenRevision`      -> "Revisar": resumen y todos los problemas antes de guardar
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

      <DialogosGuia api={api} />
      <ResumenRevision abierto={api.revisionAbierta} onCerrar={api.cerrarRevision} api={api} />
    </LocalizationProvider>
  );
};

export default GuiaRemisionNueva;

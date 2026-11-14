import type { ComponentType } from "react";
import { EnviarGuiaModal } from "./EnviarGuiaModal";
import { ProcesarGuiaModal } from "./ProcesarGuia";

/**
 * Modal que envía la guía a SUNAT. Switch `VITE_EMISION_LEGACY`:
 *  - sin definir o `false` (por defecto): guiasapi la envía por la API de
 *    facturación (EnviarGuiaModal).
 *  - `true`: el flujo anterior, en el que el front genera, firma y envía el XML
 *    con el servicio de `VITE_API_URL_GUIAS` (ProcesarGuiaModal).
 *
 * Las dos reciben las mismas props; la anterior ignora `idDespatch` salvo para
 * el PDF de la empresa.
 */
// trim(): un espacio de más en el .env ("true ") no debe cambiar el modo
export const EMISION_LEGACY = String(import.meta.env.VITE_EMISION_LEGACY ?? "").trim() === "true";

// Para saber de un vistazo qué flujo está corriendo (F12 → Consola)
console.info(
  `[Emisión de guías] ${EMISION_LEGACY ? "ANTERIOR: el front genera, firma y envía (VITE_EMISION_LEGACY=true)" : "NUEVA: por guiasapi → API de facturación"}`
);

export interface ModalEnvioGuiaProps {
  open: boolean;
  onClose: () => void;
  datosGuia: any;
  idElectronico?: number | null;
  /** Obligatorio en el flujo nuevo: es la guía que se envía. */
  idDespatch?: number | null;
  onSuccess: (resultado: any) => void;
  onError: (error: any) => void;
}

export const ModalEnvioGuia = (EMISION_LEGACY
  ? ProcesarGuiaModal
  : EnviarGuiaModal) as ComponentType<ModalEnvioGuiaProps>;

export default ModalEnvioGuia;

import apiLogged from "../api/axios.auth";
import { mensajeDeErrorApi } from "../utils/mensajeError";

/**
 * Emisión de guías por guiasapi.
 *
 * El front ya no arma, firma ni envía el XML: le pide a guiasapi que envíe la
 * guía guardada y guiasapi se la pasa a la API de facturación. El resultado de
 * SUNAT llega a guiasapi por webhook; el front solo lo lee (consultar o
 * recargando el listado).
 */

/** Estado de la guía en la API de facturación (`feEstado`). */
export type FeEstado =
  | "registered"
  | "signed"
  | "sending"
  | "pendingTicket"
  | "accepted"
  | "observed"
  | "rejected"
  | "error"
  | "voided"
  | null;

export interface ElectronicoEnvio {
  id: number;
  estado: string;
  estadoSunat: string | null;
  codigoSunat: string | null;
  descripcion: string | null;
  feId: string | null;
  feEstado: FeEstado;
  feQrUrl: string | null;
  ticket: string | null;
}

export interface ResultadoEnvio {
  exito: boolean;
  message: string;
  errors?: Record<string, string[]> | null;
  electronico?: ElectronicoEnvio | null;
  /** Código HTTP de guiasapi: 409 ya aceptada o de baja, 422 datos, 502/503 API. */
  http?: number;
}

export type TipoArchivo = "pdf" | "xml" | "cdr";
/** `a4`: el PDF de la guía ("Ver PDF"). `sunat`: el PDF que entrega SUNAT en el enlace del QR. */
export type FormatoPdf = "a4" | "sunat";

export interface ConfigFacturacion {
  ruc: string | null;
  apiUrl: string | null;
  tieneToken: boolean;
  tieneWebhookSecret: boolean;
  origen: { apiUrl: string; token: string; webhookSecret: string };
  webhookUrl: string;
}

/** Mientras está en uno de estos, SUNAT todavía no respondió. */
export const EN_PROCESO: FeEstado[] = ["registered", "sending", "pendingTicket"];
/** Aceptada u observada: la guía terminó. */
export const FINALES: FeEstado[] = ["accepted", "observed"];

export const enProceso = (fe?: FeEstado | string | null) => EN_PROCESO.includes((fe ?? null) as FeEstado);
export const esFinal = (fe?: FeEstado | string | null) => FINALES.includes((fe ?? null) as FeEstado);

/** Texto corto para mostrar el estado. */
export const etiquetaFeEstado = (fe?: FeEstado | string | null): string => {
  switch (fe) {
    case "registered":
    case "signed":
    case "sending":
    case "pendingTicket":
      return "En SUNAT, esperando respuesta";
    case "accepted":
      return "Aceptada por SUNAT";
    case "observed":
      return "Aceptada con observaciones";
    case "rejected":
      return "Rechazada por SUNAT";
    case "error":
      return "Error al enviar";
    case "voided":
      return "Anulada";
    default:
      return "Sin enviar";
  }
};

/** La respuesta de guiasapi trae el resumen igual en 200 y en los errores. */
const aResultado = (data: any, http: number): ResultadoEnvio => ({
  exito: Boolean(data?.exito),
  message: data?.message || data?.error || "",
  errors: data?.errors ?? null,
  electronico: data?.electronico ?? null,
  http,
});

const resultadoDeError = (error: any, porDefecto: string): ResultadoEnvio => {
  const data = error?.response?.data;
  if (data && typeof data === "object" && !(data instanceof Blob)) {
    return {
      ...aResultado(data, error.response.status),
      exito: false,
      message: mensajeDeErrorApi(error, porDefecto),
    };
  }
  return { exito: false, message: mensajeDeErrorApi(error, porDefecto), http: error?.response?.status };
};

/** En una descarga (`responseType: blob`) el error JSON también llega como Blob. */
const mensajeDeBlob = async (error: any, porDefecto: string): Promise<string> => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text());
      return json?.message || json?.error || porDefecto;
    } catch {
      return porDefecto;
    }
  }
  return mensajeDeErrorApi(error, porDefecto);
};

const nombreDeArchivo = (cabecera: string | undefined, porDefecto: string) => {
  const coincide = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cabecera || "");
  return coincide ? decodeURIComponent(coincide[1]) : porDefecto;
};

export const EmisionService = {
  /** Envía (o reenvía) a SUNAT una guía ya guardada. No lanza: devuelve el resultado. */
  enviar: async (idDespatch: number): Promise<ResultadoEnvio> => {
    try {
      const { data, status } = await apiLogged.post(`/api/despatches/${idDespatch}/enviar`);
      return aResultado(data, status);
    } catch (error: any) {
      return resultadoDeError(error, "No se pudo enviar la guía");
    }
  },

  /** Pregunta a la API el estado actual (por si el webhook no llegó). No lanza. */
  consultar: async (idDespatch: number): Promise<ResultadoEnvio> => {
    try {
      const { data, status } = await apiLogged.post(`/api/despatches/${idDespatch}/consultar`);
      return aResultado(data, status);
    } catch (error: any) {
      return resultadoDeError(error, "No se pudo consultar la guía");
    }
  },

  /**
   * PDF, XML o CDR de una guía enviada por la API. El enlace directo no sirve:
   * la ruta pide el token, así que se descarga como Blob. Lanza el motivo.
   */
  archivo: async (
    idDespatch: number,
    tipo: TipoArchivo = "pdf",
    formato: FormatoPdf = "a4",
    signal?: AbortSignal
  ): Promise<{ blob: Blob; nombre: string }> => {
    try {
      const respuesta = await apiLogged.get(`/api/despatches/${idDespatch}/archivo`, {
        params: tipo === "pdf" ? { tipo, formato } : { tipo },
        responseType: "blob",
        // Un 404/503 aquí es "aún no hay PDF", no una caída: sin reintentos
        sinReintentos: true,
        // Tope por si SUNAT no contesta: nunca más de 1 minuto girando
        timeout: 60000,
        signal,
      });
      // Debe ser un PDF/XML/ZIP de verdad, no una página de error con 200
      if (tipo === "pdf" && respuesta.data?.type && !/pdf|octet-stream/i.test(respuesta.data.type)) {
        throw "El servidor no devolvió un PDF";
      }
      const extension = tipo === "pdf" ? "pdf" : tipo === "cdr" ? "zip" : "xml";
      return {
        blob: respuesta.data,
        nombre: nombreDeArchivo(respuesta.headers?.["content-disposition"], `guia-${idDespatch}.${extension}`),
      };
    } catch (error: any) {
      if (typeof error === "string") throw error;
      if (error?.code === "ERR_CANCELED") throw "cancelado";
      if (error?.code === "ECONNABORTED") throw "SUNAT tardó demasiado en responder. Inténtalo en unos minutos.";
      throw await mensajeDeBlob(error, `No se pudo obtener el ${tipo.toUpperCase()} de la guía`);
    }
  },

  /** Abre el PDF en otra pestaña; XML y CDR se descargan. Lanza el motivo. */
  abrirArchivo: async (idDespatch: number, tipo: TipoArchivo = "pdf", formato: FormatoPdf = "a4") => {
    const { blob, nombre } = await EmisionService.archivo(idDespatch, tipo, formato);
    const url = URL.createObjectURL(blob);

    const ventana = tipo === "pdf" ? window.open(url, "_blank") : null;
    if (!ventana) {
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },

  /* Configuración de la conexión con la API (solo admin) */
  verConfiguracion: async (): Promise<ConfigFacturacion> => {
    try {
      const { data } = await apiLogged.get("/api/empresa/facturacion");
      return data;
    } catch (error) {
      throw mensajeDeErrorApi(error, "No se pudo leer la configuración de facturación");
    }
  },

  /** Solo se envían los campos con valor: uno vacío borraría el dato guardado. */
  guardarConfiguracion: async (valores: { apiUrl?: string; token?: string; webhookSecret?: string }) => {
    const cuerpo = Object.fromEntries(
      Object.entries(valores).filter(([, valor]) => typeof valor === "string" && valor.trim() !== "")
    );
    try {
      const { data } = await apiLogged.put("/api/empresa/facturacion", cuerpo);
      return data as ConfigFacturacion & { message: string };
    } catch (error) {
      throw mensajeDeErrorApi(error, "No se pudo guardar la configuración de facturación");
    }
  },

  probarConexion: async (): Promise<{ exito: boolean; message: string }> => {
    try {
      const { data } = await apiLogged.post("/api/empresa/facturacion/probar");
      return { exito: Boolean(data?.exito), message: data?.message || "" };
    } catch (error: any) {
      return { exito: false, message: mensajeDeErrorApi(error, "No se pudo probar la conexión") };
    }
  },
};

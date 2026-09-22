/**
 * Texto legible de un error de axios con el backend Laravel:
 *  - 422: `{ message, errors: { campo: [mensajes] } }` -> todos los mensajes;
 *  - `{ error }` o `{ message }` -> tal cual;
 *  - sin respuesta -> problema de conexión.
 */
export const mensajeDeErrorApi = (error: unknown, porDefecto: string): string => {
  if (typeof error === "string") return error || porDefecto;

  const e = error as {
    response?: { status?: number; data?: any };
    request?: unknown;
    code?: string;
    message?: string;
  };
  const data = e?.response?.data;
  const status = e?.response?.status;

  if (data?.errors && typeof data.errors === "object") {
    const mensajes = Object.values(data.errors as Record<string, unknown>)
      .flatMap((valor) => (Array.isArray(valor) ? valor : [valor]))
      .map((valor) => String(valor ?? "").trim())
      .filter(Boolean);
    const unicos = Array.from(new Set(mensajes));
    if (unicos.length > 0) return unicos.join(" ");
  }

  if (typeof data?.errors === "string" && data.errors) return data.errors;
  const texto = data?.error || data?.message;
  if (typeof texto === "string" && texto) return texto;

  if (!e?.response && (e?.request || e?.code === "ERR_NETWORK" || e?.message === "Network Error")) {
    return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  }
  if (e?.code === "ECONNABORTED") return "El servidor tardó demasiado en responder. Inténtalo de nuevo.";
  if (status && status >= 500) return `Error del servidor (HTTP ${status}). Inténtalo más tarde.`;
  if (status) return `${porDefecto} (HTTP ${status})`;
  return e?.message || porDefecto;
};

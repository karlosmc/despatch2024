/**
 * Módulos que dependen de cada empresa. Se activan por despliegue, igual que el
 * logo o la URL del API, con variables del archivo .env:
 *
 *   VITE_GUIA_RAPIDA=true   -> muestra la Guía rápida (requiere el servicio SCOP).
 *
 * Si la variable no está o tiene otro valor, el módulo queda oculto.
 */
const activo = (valor: unknown) => /^(true|1|si|sí|on)$/i.test(String(valor ?? "").trim());

export const GUIA_RAPIDA_HABILITADA = activo(import.meta.env.VITE_GUIA_RAPIDA);

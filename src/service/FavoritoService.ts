import apiLogged from "../api/axios.auth";

/**
 * Catálogos que acepta `/api/favoritos`. La API sólo documenta `producto` como
 * ejemplo; si el backend usa otro nombre, su respuesta 422 trae la lista válida
 * en `tipos` y se muestra en el mensaje de error. Ajustar aquí y en ningún otro lado.
 */
export const TIPOS_FAVORITO = {
  producto: "producto",
  cliente: "cliente",
  punto: "punto",
  conductor: "conductor",
  transportista: "transportista",
  vehiculo: "vehiculo",
} as const;

export type TipoFavorito = (typeof TIPOS_FAVORITO)[keyof typeof TIPOS_FAVORITO];

/**
 * Preferencias del usuario sobre un registro. Lo que se omite no cambia en el
 * servidor; un `nombreCorto` vacío vuelve al nombre del catálogo.
 */
export interface PreferenciasFavorito {
  fav?: boolean;
  nombreCorto?: string | null;
}

/** Respuesta de `GET /api/favoritos`, agrupada por tipo. */
export interface ListadoFavoritos {
  favoritos: Record<string, number[]>;
  nombresCortos: Record<string, Record<string, string>>;
}

/** El campo `fav` puede llegar como boolean, 0/1 o "0"/"1". */
export const esFavorito = (valor: unknown): boolean =>
  valor === true || valor === 1 || valor === "1" || valor === "true";

/**
 * Cambios confirmados en esta sesión. Los listados se cargan una vez y no se
 * enteran de lo que se marca después; sin esto, una tabla paginada o un modal
 * de edición abierto luego mostrarían (y guardarían) el valor viejo.
 */
const cambiosDeSesion = new Map<string, boolean>();
const claveFavorito = (tipo: TipoFavorito, id: number) => `${tipo}:${id}`;

/** Valor vigente: el último confirmado en la sesión o, si no hay, el del servidor. */
export const favoritoVigente = (
  tipo: TipoFavorito,
  id: number | undefined | null,
  delServidor: unknown
): boolean => {
  const cambio = id ? cambiosDeSesion.get(claveFavorito(tipo, id)) : undefined;
  return cambio ?? esFavorito(delServidor);
};

/** Se llama cuando un listado se recarga con datos nuevos del servidor. */
export const olvidarCambioFavorito = (tipo: TipoFavorito, id: number) =>
  cambiosDeSesion.delete(claveFavorito(tipo, id));

const mensajeDeError = (error: any, porDefecto: string): string => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (data?.tipos) {
    const tipos = Array.isArray(data.tipos) ? data.tipos.join(", ") : data.tipos;
    return `${data.error || "Tipo de favorito no válido"} (válidos: ${tipos})`;
  }

  // Validación de Laravel (422): { message, errors: { campo: [mensajes] } }
  if (data?.errors && typeof data.errors === "object") {
    const detalle = Object.entries(data.errors)
      .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes[0] : mensajes}`)
      .join("; ");
    if (detalle) return detalle;
  }

  const texto = data?.error || data?.message;
  if (texto) return texto;
  return status ? `${porDefecto} (HTTP ${status})` : porDefecto;
};

/**
 * Preferencias por usuario (favorito y nombre corto propio): cambiarlas no
 * toca los datos compartidos del registro.
 */
export const FavoritoService = {
  /** Ids marcados y nombres cortos del usuario, agrupados por tipo (o de un solo tipo). */
  listar: async (tipo?: TipoFavorito): Promise<ListadoFavoritos> => {
    try {
      const { data } = await apiLogged.get("/api/favoritos", { params: tipo ? { tipo } : {} });
      return {
        favoritos: data?.favoritos || {},
        nombresCortos: data?.nombresCortos || {},
      };
    } catch (error: any) {
      console.error("Error al listar favoritos:", error);
      throw mensajeDeError(error, "Error al listar los favoritos");
    }
  },

  /**
   * `PUT /api/favoritos/{tipo}/{id}`: guarda sólo lo que se envía y nunca
   * alterna, así un doble clic o un reintento no dejan el valor al revés.
   */
  actualizarPreferencias: async (
    tipo: TipoFavorito,
    id: number,
    preferencias: PreferenciasFavorito
  ) => {
    try {
      const { data } = await apiLogged.put(`/api/favoritos/${tipo}/${id}`, preferencias);
      if (data && typeof data === "object" && data.exito === false) {
        throw data.error || data.message || "No se pudieron guardar tus preferencias";
      }
      if (typeof preferencias.fav === "boolean") {
        cambiosDeSesion.set(claveFavorito(tipo, id), preferencias.fav);
      }
      return data;
    } catch (error: any) {
      if (typeof error === "string") throw error;
      console.error("Error al guardar preferencias:", error);
      throw mensajeDeError(error, "No se pudieron guardar tus preferencias");
    }
  },

  /** Fija el favorito en el valor indicado. */
  marcar: (tipo: TipoFavorito, id: number, fav: boolean) =>
    FavoritoService.actualizarPreferencias(tipo, id, { fav }),

  /** Desmarca el favorito; el backend conserva el nombre corto propio. */
  quitar: async (tipo: TipoFavorito, id: number) => {
    try {
      const { data } = await apiLogged.delete(`/api/favoritos/${tipo}/${id}`);
      cambiosDeSesion.set(claveFavorito(tipo, id), false);
      return data;
    } catch (error: any) {
      console.error("Error al quitar favorito:", error);
      throw mensajeDeError(error, "No se pudo quitar el favorito");
    }
  },

  /**
   * Para los modales de alta/edición: deja el favorito del usuario en el valor
   * elegido una vez guardado el registro. En un alta sin favorito no hace nada.
   *
   * El nombre corto no se envía aquí: el propio `PUT` del catálogo ya lo guarda
   * como preferencia del usuario (y en el alta fija el del catálogo).
   * Devuelve `null` si quedó bien, o el motivo del fallo para mostrarlo; nunca
   * interrumpe el guardado ya hecho.
   */
  sincronizar: async (
    tipo: TipoFavorito,
    id: number | undefined | null,
    fav: unknown,
    esEdicion: boolean
  ): Promise<string | null> => {
    const marcado = esFavorito(fav);
    if (!esEdicion && !marcado) return null;
    if (!id) {
      console.warn(`No se pudo sincronizar el favorito de ${tipo}: el guardado no devolvió id`);
      return "el guardado no devolvió el id del registro";
    }
    try {
      await FavoritoService.marcar(tipo, id, marcado);
      return null;
    } catch (error) {
      console.warn(`No se pudo sincronizar el favorito de ${tipo} ${id}:`, error);
      return typeof error === "string" ? error : "error desconocido";
    }
  },
};

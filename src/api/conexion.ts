/**
 * Canal liviano entre el cliente HTTP y la interfaz: el interceptor avisa
 * cuando reintenta o pierde el servidor, y el banner de conexión lo muestra.
 * Se usa un evento del navegador para no acoplar axios con React.
 */
export const EVENTO_CONEXION = "api:conexion";

export type EstadoConexion = "reintentando" | "recuperada" | "caida";

export interface DetalleConexion {
  estado: EstadoConexion;
  intento?: number;
  maximo?: number;
}

export const emitirEstadoConexion = (detalle: DetalleConexion) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DetalleConexion>(EVENTO_CONEXION, { detail: detalle }));
};

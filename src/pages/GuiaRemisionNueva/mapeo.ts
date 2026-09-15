import dayjs from "dayjs";

import {
  Detail,
  Direccion,
  Envio,
  EnvioVehiculo,
  GuiaRemision,
  Transportista,
} from "../../types/guias/guiaremision.interface";
import { VehiculoValues, initialValues } from "./constants";

/**
 * La API devuelve la guía con una forma distinta a la del formulario:
 *  - `envio.vehiculo` es un arreglo con `tipo` "P" (principal) o "S" (secundario)
 *  - `envio.indicadores` son objetos `{ indicador }` y no strings
 *  - las claves foráneas vienen como `id_producto`, `id_transportista`, `id_puntoubicacion`
 *  - las fechas llegan con hora
 */

const soloFecha = (valor?: string | null): string =>
  valor ? dayjs(valor).format("YYYY-MM-DD") : "";

/** Acepta tanto `['SUNAT_...']` como `[{ indicador: 'SUNAT_...' }]`. */
export const normalizarIndicadores = (indicadores: any): string[] => {
  if (!Array.isArray(indicadores)) return [];
  return indicadores
    .map((item) => (typeof item === "string" ? item : item?.indicador))
    .filter(Boolean);
};

const mapearVehiculos = (vehiculo: any): EnvioVehiculo => {
  if (!vehiculo) return { ...VehiculoValues };

  // Formato de la API: arreglo con tipo P / S
  if (Array.isArray(vehiculo)) {
    const principal = vehiculo.find((ve: any) => ve.tipo === "P");
    const secundarios = vehiculo.filter((ve: any) => ve.tipo === "S");
    if (!principal) return { ...VehiculoValues, secundarios };
    return { ...principal, secundarios };
  }

  // Formato del formulario (por si ya viene normalizado)
  return { ...VehiculoValues, ...vehiculo, secundarios: vehiculo.secundarios || [] };
};

const mapearDireccion = (direccion: any, porDefecto: Direccion): Direccion => {
  if (!direccion) return { ...porDefecto };
  return {
    ...porDefecto,
    ...direccion,
    id: direccion.id ?? direccion.id_puntoubicacion ?? 0,
    ruc: direccion.ruc || "",
    rznSocial: direccion.rznSocial || "",
  };
};

export interface GuiaCargada {
  values: GuiaRemision;
  envio: Envio;
  detalles: Detail[];
  addDocs: any[];
  idDespatch: number | null;
  idElectronico: number | null;
  estado: string | null;
}

export const mapearGuiaDesdeApi = (guiaData: any): GuiaCargada => {
  const vehiculo = mapearVehiculos(guiaData?.envio?.vehiculo);

  const detalles: Detail[] = (guiaData?.details || []).map((detalle: any) => ({
    ...detalle,
    id: detalle.id_producto ?? detalle.id ?? 0,
  }));

  const addDocs = guiaData?.addDocs || [];

  const transportistaApi = guiaData?.envio?.transportista;
  const transportista: Transportista = transportistaApi
    ? {
        ...initialValues.transportista,
        ...transportistaApi,
        id: transportistaApi.id ?? transportistaApi.id_transportista ?? 0,
        nroMtc: transportistaApi.nroMtc || "",
      }
    : { ...initialValues.transportista };

  const envio: Envio = {
    ...initialValues.envio,
    ...guiaData?.envio,
    indicadores: normalizarIndicadores(guiaData?.envio?.indicadores),
    fecTraslado: soloFecha(guiaData?.envio?.fecTraslado),
    fecInicioTrasladoBienes: guiaData?.envio?.fecInicioTrasladoBienes
      ? soloFecha(guiaData.envio.fecInicioTrasladoBienes)
      : "",
  };

  // Estos viven en `envio` en la API pero en la raíz del formulario.
  delete (envio as any).vehiculo;
  delete (envio as any).choferes;
  delete (envio as any).partida;
  delete (envio as any).llegada;
  delete (envio as any).transportista;

  const values: GuiaRemision = {
    datosGenerales: {
      correlativo: String(guiaData?.correlativo ?? "0"),
      fechaEmision: soloFecha(guiaData?.fechaEmision),
      serie: guiaData?.serie || "",
      tipoDoc: guiaData?.tipoDoc || "09",
      version: guiaData?.version || "2.0",
    },
    destinatario: guiaData?.destinatario
      ? { ...initialValues.destinatario, ...guiaData.destinatario }
      : { ...initialValues.destinatario },
    tercero: guiaData?.tercero
      ? { ...initialValues.tercero, ...guiaData.tercero }
      : { ...initialValues.tercero },
    envio,
    addDocs,
    details: detalles,
    choferes: guiaData?.envio?.choferes || [],
    vehiculo,
    partida: mapearDireccion(guiaData?.envio?.partida, initialValues.partida),
    llegada: mapearDireccion(guiaData?.envio?.llegada, initialValues.llegada),
    transportista,
    observacion: guiaData?.observacion || "",
  };

  return {
    values,
    envio,
    detalles,
    addDocs,
    idDespatch: guiaData?.id ?? null,
    idElectronico: guiaData?.electronico?.id ?? null,
    estado: guiaData?.electronico?.estado ?? null,
  };
};

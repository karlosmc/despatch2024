import dayjs from "dayjs";
import {
  DatosGenerales,
  Envio,
  EnvioVehiculo,
  GuiaRemision,
} from "../../types/guias/guiaremision.interface";

/** Identificadores de cada sección del formulario. */
export type SeccionId =
  | "generales"
  | "envio"
  | "personas"
  | "puntos"
  | "bienes"
  | "transporte"
  | "observaciones";

export const VehiculoValues: EnvioVehiculo = {
  id: 0,
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: [],
};

export const EnvioValues: Envio = {
  codTraslado: "",
  desTraslado: "",
  fecTraslado: dayjs().format("YYYY-MM-DD"),
  indicadores: [],
  indTransbordo: "",
  modTraslado: "02",
  numBultos: 0,
  pesoTotal: 1,
  undPesoTotal: "KGM",
};

export const DatosGeneralesValues: DatosGenerales = {
  correlativo: "0",
  fechaEmision: dayjs().format("YYYY-MM-DD"),
  serie: "",
  tipoDoc: "09",
  version: "2.0",
};

export const initialValues: GuiaRemision = {
  datosGenerales: DatosGeneralesValues,
  destinatario: {
    id: 0,
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  tercero: {
    id: 0,
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  envio: EnvioValues,
  addDocs: [],
  details: [],
  choferes: [],
  vehiculo: VehiculoValues,
  partida: {
    id: 0,
    codLocal: "0000",
    direccion: "",
    ruc: "",
    ubigeo: "",
    rznSocial: "",
  },
  llegada: {
    id: 0,
    codLocal: "0000",
    direccion: "",
    ruc: "",
    ubigeo: "",
    rznSocial: "",
  },
  transportista: {
    id: 0,
    nroMtc: "",
    numDoc: "",
    rznSocial: "",
    tipoDoc: "6",
  },
  observacion: "",
};

export const INDICADOR_M1L = "SUNAT_Envio_IndicadorTrasladoVehiculoM1L";
export const TRANSPORTE_PUBLICO = "01";
export const TRANSPORTE_PRIVADO = "02";

/**
 * En el formulario original esta condición estaba invertida
 * (pedía la fecha de inicio de traslado cuando SÍ estaba escrita).
 * Se corrigió aquí; pon esto en `false` para volver al comportamiento anterior.
 */
export const EXIGIR_FEC_INICIO_TRASLADO = true;

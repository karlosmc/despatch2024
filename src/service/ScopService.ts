import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import scopFake from "../fake/scop.json";
import {
  PedidoScop,
  RegistroScop,
  ScopConsulta,
  ScopRespuesta,
  TipoScop,
} from "../types/scop.interface";
import apiLogged from "../api/axios.auth";

dayjs.extend(customParseFormat);

/**
 * De dónde salen los pedidos:
 *  - "fake":      no hay VITE_API_SCOP -> datos de prueba de `fake/scop.json`.
 *  - "proxy-dev": desarrollo -> `/scop-api`; vite.config.ts reenvía al servicio y agrega la clave.
 *  - "backend":   build de producción -> `POST /api/scop/consulta` en Laravel, que debe
 *                 reenviar al servicio con la clave (el navegador no puede llamarlo directo).
 */
export type ModoScop = "fake" | "proxy-dev" | "backend";

// export const SCOP_MODO: ModoScop = !import.meta.env.VITE_API_SCOP
//   ? "fake"
//   : import.meta.env.DEV
//   ? "proxy-dev"
//   : "backend";

export const SCOP_MODO: ModoScop = "backend";

/** El portal SCOP rechaza rangos de más de 7 días (contando ambos extremos). */
export const MAX_DIAS_SCOP = 7;

/** La consulta al portal puede tardar: se espera hasta 90 s. */
const TIEMPO_MAXIMO_MS = 90_000;

const SCOP_FAKE = scopFake as ScopRespuesta;
const FORMATO_FECHA_SCOP = "DD/MM/YYYY HH:mm:ss";

/** Pedidos que ya no se pueden usar en una guía: cerrados o anulados (en cualquier género). */
const ESTADO_NO_DISPONIBLE = /^(CERRAD|ANULAD)[AO]\b/i;

/** "abc123", "ABC 123" o "ABC-123" -> "ABC-123". */
export const normalizarPlaca = (placa?: string | null): string => {
  const limpia = (placa || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (limpia.length <= 3) return limpia;
  return `${limpia.slice(0, 3)}-${limpia.slice(3)}`;
};

/**
 * Convierte el volumen a número. Los líquidos usan coma de miles ("2,940") y el
 * GLP punto decimal ("3801.3"); si aparecen ambos, el último es el decimal.
 */
export const parseVolumen = (valor: unknown): number => {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  let texto = String(valor ?? "").replace(/\s/g, "");
  if (!texto) return 0;

  const tieneComa = texto.includes(",");
  const tienePunto = texto.includes(".");

  if (tieneComa && tienePunto) {
    texto =
      texto.lastIndexOf(",") > texto.lastIndexOf(".")
        ? texto.replace(/\./g, "").replace(",", ".")
        : texto.replace(/,/g, "");
  } else if (tieneComa) {
    texto = /^\d{1,3}(,\d{3})+$/.test(texto)
      ? texto.replace(/,/g, "")
      : texto.replace(",", ".");
  }

  const numero = parseFloat(texto);
  return Number.isFinite(numero) ? numero : 0;
};

/** Días del rango contando ambos extremos: del 10 al 16 son 7. */
export const diasDelRango = (desde: string, hasta: string) =>
  dayjs(hasta).diff(dayjs(desde), "day") + 1;

/** Mismas reglas que aplica el servicio, para avisar antes de consultar. */
export const validarConsultaScop = (consulta: ScopConsulta): string | null => {
  if (!String(consulta.sucursal ?? "").trim())
    return "Falta la sucursal: elige el punto de llegada.";
  if (!consulta.para_liquido && !consulta.para_glp)
    return "Elige líquidos, GLP o ambos.";

  const desde = dayjs(consulta.fecha_inicio);
  const hasta = dayjs(consulta.fecha_fin);
  if (!desde.isValid() || !hasta.isValid())
    return "Las fechas del rango no son válidas.";
  if (hasta.isBefore(desde, "day"))
    return "La fecha final es anterior a la inicial.";
  if (diasDelRango(consulta.fecha_inicio, consulta.fecha_fin) > MAX_DIAS_SCOP) {
    return `El rango no puede pasar de ${MAX_DIAS_SCOP} días (límite del portal SCOP).`;
  }
  return null;
};

/** Compara claves sin acentos, espacios ni símbolos ("N° Factura" = "Nº Factura"). */
const normalizarClave = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const leerCampo = (registro: RegistroScop, ...nombres: string[]): string => {
  const buscadas = nombres.map(normalizarClave);
  const clave = Object.keys(registro).find((k) =>
    buscadas.includes(normalizarClave(k)),
  );
  return clave ? String(registro[clave] ?? "").trim() : "";
};

const facturaValida = (valor: string) => {
  const texto = valor.trim().toUpperCase();
  return texto && texto !== "-" ? texto : "";
};

const fechaDePedido = (registro: RegistroScop) =>
  dayjs(leerCampo(registro, "Fecha Pedido"), FORMATO_FECHA_SCOP, true);

/**
 * Extrae de la respuesta sólo lo que usa la guía. Líquidos: "Factura" y
 * "Estado Det. Pedido"; GLP: "N° Factura" y "Est. Det. Pedido".
 * Devuelve todos los pedidos (disponibles o no), del más reciente al más antiguo.
 */
export const aPedidos = (respuesta: ScopRespuesta): PedidoScop[] => {
  const pedidos: PedidoScop[] = [];

  (["liquido", "glp"] as TipoScop[]).forEach((tipo) => {
    const bloque = respuesta[tipo];
    if (!bloque?.ok || !Array.isArray(bloque.registros)) return;

    bloque.registros.forEach((registro) => {
      const codigoAutorizacion = leerCampo(registro, "Código Autorización");
      if (!codigoAutorizacion) return;

      const estado = leerCampo(
        registro,
        "Estado Det. Pedido",
        "Est. Det. Pedido",
      );
      const fecha = fechaDePedido(registro);

      pedidos.push({
        tipo,
        codigoAutorizacion,
        factura: facturaValida(
          tipo === "liquido"
            ? leerCampo(registro, "Factura")
            : leerCampo(registro, "N° Factura"),
        ),
        fechaPedido: leerCampo(registro, "Fecha Pedido"),
        fechaOrden: fecha.isValid() ? fecha.valueOf() : 0,
        estado,
        disponible: !ESTADO_NO_DISPONIBLE.test(estado),
        producto: leerCampo(registro, "Producto"),
        volumen: parseVolumen(leerCampo(registro, "Volumen")),
        // GLP la informa en "Unidad Medida"; el bloque de líquidos no la trae.
        unidad: leerCampo(registro, "Unidad Medida", "Unidad de Medida", "Unidad"),
        vendedor: leerCampo(registro, "Vendedor Razón Social", "Vendedor Razon Social"),
        provProducto: leerCampo(registro, "Prov. Producto", "Prov Producto", "Proveedor Producto"),
        placa: normalizarPlaca(leerCampo(registro, "Placa")),
      });
    });
  });

  return pedidos.sort((a, b) => b.fechaOrden - a.fechaOrden);
};

const soloAlfanumerico = (texto?: string | null) =>
  (texto || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/**
 * Pedidos de una placa. Compara sin guiones ni espacios, igual que el backend.
 * Un pedido sin placa se conserva: en GLP la sucursal ya es la placa.
 */
export const filtrarPorPlaca = (pedidos: PedidoScop[], placa?: string | null): PedidoScop[] => {
  const buscada = soloAlfanumerico(placa);
  if (!buscada) return pedidos;
  return pedidos.filter((p) => {
    const propia = soloAlfanumerico(p.placa);
    return !propia || propia.includes(buscada);
  });
};

/* ------------------------------------------------------------------ */
/* Errores                                                              */
/* ------------------------------------------------------------------ */

/** El servicio responde errores como `{ "error": "..." }`; se muestran tal cual. */
const motivoScop = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (axios.isCancel(error as unknown)) return "Consulta cancelada.";

  const e = error as AxiosError<any>;
  if (e?.isAxiosError) {
    if (!e.response) {
      return e.code === "ECONNABORTED"
        ? "El SCOP tardó demasiado en responder. Intenta de nuevo."
        : "No se pudo conectar con el servicio SCOP (red o servicio caído).";
    }
    const texto = e.response.data?.error || e.response.data?.message;
    const status = e.response.status;
    if (status === 401 || status === 403) {
      return texto
        ? `El servicio SCOP rechazó la clave: ${texto}`
        : "El servicio SCOP rechazó la clave.";
    }
    if (texto) return texto;
    if (status === 504) return "El servicio SCOP no respondió a tiempo. Intenta de nuevo.";
    if (status === 502) return "El servicio SCOP o el portal fallaron. Intenta de nuevo en unos minutos.";
    if (status === 503) return "Ya hay una consulta igual en curso que no termina. Espera y vuelve a consultar.";
    if (status === 404 && SCOP_MODO === "backend") {
      return "El backend todavía no tiene la ruta /api/scop/consulta.";
    }
    return `El servicio SCOP respondió con error ${status}.`;
  }

  return error instanceof Error
    ? error.message
    : "Error desconocido al consultar el SCOP.";
};

/* ------------------------------------------------------------------ */
/* API de prueba                                                        */
/* ------------------------------------------------------------------ */

/**
 * Simula el servicio: devuelve sólo los bloques pedidos (`para_liquido`,
 * `para_glp`), filtrados por rango de fechas de pedido y por placa.
 */
const consultarFake = async (
  consulta: ScopConsulta,
): Promise<ScopRespuesta> => {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const placa = normalizarPlaca(consulta.placa);
  const tipos: TipoScop[] = [
    ...(consulta.para_liquido ? (["liquido"] as TipoScop[]) : []),
    ...(consulta.para_glp ? (["glp"] as TipoScop[]) : []),
  ];

  const enRango = (registro: RegistroScop) => {
    const fecha = fechaDePedido(registro);
    if (!fecha.isValid()) return false;
    const dia = fecha.format("YYYY-MM-DD");
    return dia >= consulta.fecha_inicio && dia <= consulta.fecha_fin;
  };

  const armar = (): ScopRespuesta => {
    const respuesta: ScopRespuesta = {
      sucursal: consulta.sucursal || SCOP_FAKE.sucursal,
      fecha_inicio: consulta.fecha_inicio,
      fecha_fin: consulta.fecha_fin,
    };
    tipos.forEach((tipo) => {
      const bloque = SCOP_FAKE[tipo];
      if (!bloque) return;
      const registros = bloque.registros
        .filter(enRango)
        .filter(
          (r) => !placa || normalizarPlaca(leerCampo(r, "Placa")) === placa,
        );
      respuesta[tipo] = {
        ok: true,
        total: bloque.registros.length,
        coincidencias: registros.length,
        registros,
      };
    });
    return respuesta;
  };

  // Igual que el servicio real: sólo lo que trae la placa, aunque no haya nada.
  return armar();
};

/* ------------------------------------------------------------------ */
/* Servicio                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* SCOP temporales (cargados en guiasapi por la app de campo)           */
/* ------------------------------------------------------------------ */

/**
 * De dónde salen los pedidos que se eligen en la guía rápida:
 *  - "temporal" (por defecto): lo cargado en guiasapi (`scop_temporal`) para la
 *    placa de la cisterna. No necesita sucursal ni rango de fechas.
 *  - "portal": consulta directa al portal SCOP por sucursal y rango (como antes).
 *  - "manual": no se consulta nada; el SCOP, la factura y el producto se agregan a mano.
 * Se cambia con VITE_SCOP_FUENTE=portal|manual (Vite lo lee al iniciar o compilar).
 */
export type FuenteScop = "temporal" | "portal" | "manual";

const FUENTE_ENV = String(import.meta.env.VITE_SCOP_FUENTE ?? "").trim();
export const SCOP_FUENTE: FuenteScop = FUENTE_ENV === "portal" || FUENTE_ENV === "manual" ? FUENTE_ENV : "temporal";

/** Un SCOP de `GET /api/scop/temporales`. */
export interface ScopTemporal {
  nroScop: string;
  factura: string | null;
  proveedor: string | null;
  /** YYYY-MM-DD HH:mm:ss */
  fechaPedido: string | null;
  fechaVenta: string | null;
  fechaDespacho: string | null;
  estadoPedido: string | null;
  producto: string | null;
  placa: string;
  /** Establecimiento (punto de ubicación) del SCOP; null en GLP o si no se cargó. */
  idEstablecimiento: number | null;
  volumen: number | string | null;
  unidadMedida: string | null;
  /** false = ya está en otra guía (`guia` dice cuál). */
  disponible: boolean;
  /** Es de la guía que se está editando. */
  enEstaGuia: boolean;
  id_despatch: number | null;
  guia: string | null;
}

/** "2026-11-15 10:00:00" → "15/11/2026 10:00:00" (el formato que muestra la lista). */
const aFormatoScop = (fecha?: string | null) => {
  const d = fecha ? dayjs(fecha) : null;
  return d && d.isValid() ? d.format(FORMATO_FECHA_SCOP) : "";
};

/**
 * Convierte un SCOP temporal al pedido que usa la guía. El proveedor hace de
 * vendedor (GLP) y de "Prov. Producto" (líquidos): de ahí salen los chips.
 */
export const aPedidoTemporal = (s: ScopTemporal, tipo: TipoScop): PedidoScop => {
  const referencia = dayjs(s.fechaDespacho || s.fechaPedido || "");
  const estado = (s.estadoPedido || "").trim();
  const proveedor = (s.proveedor || "").trim();

  return {
    tipo,
    codigoAutorizacion: String(s.nroScop).trim(),
    factura: facturaValida(s.factura || ""),
    fechaPedido: aFormatoScop(s.fechaPedido || s.fechaDespacho),
    fechaOrden: referencia.isValid() ? referencia.valueOf() : 0,
    estado,
    disponible: !ESTADO_NO_DISPONIBLE.test(estado),
    producto: (s.producto || "").trim(),
    volumen: parseVolumen(s.volumen),
    unidad: (s.unidadMedida || "").trim(),
    vendedor: proveedor,
    provProducto: proveedor,
    placa: normalizarPlaca(s.placa),
  };
};

const motivoTemporales = (error: unknown): string => {
  if (axios.isCancel(error as unknown)) return "Consulta cancelada.";
  const e = error as AxiosError<any>;
  if (e?.isAxiosError) {
    if (!e.response) return "No se pudo conectar con el servidor para traer los SCOP.";
    const texto = e.response.data?.error || e.response.data?.message;
    if (texto) return texto;
    return `El servidor respondió con error ${e.response.status} al traer los SCOP.`;
  }
  return error instanceof Error ? error.message : "No se pudieron traer los SCOP de la placa.";
};

/** Uso de un número de SCOP en guías guardadas. */
export interface UsoScop {
  nroScop: string;
  disponible: boolean;
  id_despatch: number | null;
  /** Serie-correlativo de la guía que lo usa (null si está libre). */
  guia: string | null;
}

export const ScopService = {
  /**
   * Qué números ya están en otra guía. `idDespatch` (guía en edición) hace que
   * sus propios números no salgan como ocupados. Devuelve un mapa por número.
   */
  disponibilidad: async (
    numeros: string[],
    idDespatch?: number | null,
    opciones: { signal?: AbortSignal } = {},
  ): Promise<Record<string, UsoScop>> => {
    const unicos = Array.from(new Set(numeros.map((n) => (n || "").trim()).filter(Boolean)));
    if (unicos.length === 0) return {};

    const params = new URLSearchParams();
    unicos.forEach((n) => params.append("nroScop[]", n));
    if (idDespatch) params.append("id_despatch", String(idDespatch));

    const { data } = await apiLogged.get(`/api/scop/disponible?${params.toString()}`, {
      signal: opciones.signal,
    });
    const mapa: Record<string, UsoScop> = {};
    (Array.isArray(data?.scops) ? data.scops : []).forEach((uso: UsoScop) => {
      if (uso?.nroScop) mapa[String(uso.nroScop).trim()] = uso;
    });
    return mapa;
  },

  /**
   * SCOP cargados en guiasapi para una placa (`GET /api/scop/temporales`), ya
   * convertidos a pedidos. Incluye los usados en otra guía: la lista los muestra
   * deshabilitados (ver `disponibilidad`). `idDespatch` = guía en edición.
   *
   * Líquidos: `idLlegada` (punto de llegada) deja sólo los SCOP de ese
   * establecimiento y los cargados sin establecimiento. En GLP no se envía.
   */
  temporales: async (
    placa: string,
    tipo: TipoScop,
    idDespatch?: number | null,
    idLlegada?: number | string | null,
    opciones: { signal?: AbortSignal } = {},
  ): Promise<PedidoScop[]> => {
    try {
      const { data } = await apiLogged.get(`/api/scop/temporales`, {
        params: {
          // Sin guion ni espacios: así está guardada en scop_temporal ("ABC-123" → "ABC123")
          placa: soloAlfanumerico(placa),
          ...(idDespatch ? { id_despatch: idDespatch } : {}),
          ...(tipo === "liquido" && idLlegada ? { id_puntoubicacion: idLlegada } : {}),
        },
        signal: opciones.signal,
      });
      const lista: ScopTemporal[] = Array.isArray(data?.scops) ? data.scops : [];
      // El backend ya los ordena (más reciente primero)
      return lista.filter((s) => s?.nroScop).map((s) => aPedidoTemporal(s, tipo));
    } catch (error) {
      if (!axios.isCancel(error as unknown)) console.error("Error al traer los SCOP temporales:", error);
      throw motivoTemporales(error);
    }
  },

  /**
   * `signal` permite abandonar la consulta cuando cambia la búsqueda. Espera como
   * máximo TIEMPO_MAXIMO_MS y detecta los errores que llegan dentro de un 200.
   */
  consultar: async (
    consulta: ScopConsulta,
    opciones: { signal?: AbortSignal } = {},
  ): Promise<ScopRespuesta> => {
    const placa = normalizarPlaca(consulta.placa);
    const solicitud: ScopConsulta = {
      sucursal: String(consulta.sucursal ?? "").trim(),
      fecha_inicio: consulta.fecha_inicio,
      fecha_fin: consulta.fecha_fin,
      para_liquido: consulta.para_liquido,
      para_glp: consulta.para_glp,
      // La placa es opcional: sin ella llega todo lo de la sucursal.
      ...(placa ? { placa } : {}),
      ...(consulta.refrescar ? { refrescar: true } : {}),
    };

    // console.log(SCOP_MODO)
    const invalida = validarConsultaScop(solicitud);
    if (invalida) throw invalida;

    if ((SCOP_MODO as ModoScop) === "fake") return consultarFake(solicitud);

    try {
      // La ruta de Laravel requiere la sesión del usuario.
      const { data } = await apiLogged.post(`/api/scop/consulta`, solicitud, {
        timeout: TIEMPO_MAXIMO_MS,
        signal: opciones.signal,
      });

      // Errores que llegan con HTTP 200.
      if (data?.error) throw data.error;
      if (data?.success === false) throw data.message || "El servicio SCOP no devolvió datos.";

      const respuesta: ScopRespuesta | undefined = data?.data;
      if (!respuesta || typeof respuesta !== "object") {
        throw "El servicio SCOP devolvió una respuesta vacía.";
      }
      if ((respuesta as { error?: string }).error) throw (respuesta as { error?: string }).error;

      // El portal puede fallar sólo en un bloque: se informa en vez de mostrar "sin pedidos".
      const fallos = (["liquido", "glp"] as TipoScop[])
        .filter((tipo) => (tipo === "liquido" ? solicitud.para_liquido : solicitud.para_glp))
        .filter((tipo) => respuesta[tipo] && respuesta[tipo]?.ok === false)
        .map(
          (tipo) =>
            respuesta[tipo]?.error ||
            respuesta[tipo]?.mensaje ||
            `El portal no devolvió los pedidos de ${tipo === "glp" ? "GLP" : "líquidos"}.`,
        );
      if (fallos.length > 0) throw fallos.join(" ");

      const cache = data?.desde_cache;
      return { ...respuesta, desdeCache: cache === true || cache === 1 || cache === "1" || cache === "true" };
    } catch (error) {
      console.error("Error al consultar el SCOP:", error);
      throw motivoScop(error);
    }
  },
};

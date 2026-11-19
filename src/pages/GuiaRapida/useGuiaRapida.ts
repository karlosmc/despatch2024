import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

import { useGuiaRemisionForm } from "../GuiaRemisionNueva/useGuiaRemisionForm";
import {
  EnvioValues,
  TRANSPORTE_PRIVADO,
  VehiculoValues,
  initialValues,
} from "../GuiaRemisionNueva/constants";
import {
  AddDoc,
  Client,
  Detail,
  Direccion,
  EnvioChoferes,
  EnvioVehiculo,
} from "../../types/guias/guiaremision.interface";
import { numeracion } from "../../types/numeracion.interface";
import { puntoEmision } from "../../types/puntoemision.interface";
import { vehiculo } from "../../types/vehiculo.interface";
import { persona } from "../../types/persona.interface";
import { puntoUbicacion } from "../../types/puntoubicacion.interface";
import { conductor } from "../../types/conductor.interface";
import { Producto } from "../../types/producto.interface";
import { PedidoScop, TipoScop } from "../../types/scop.interface";

import { NumeracionService } from "../../service/NumeracionService";
import { VehiculoService } from "../../service/VehiculoService";
import { PersonaService } from "../../service/PersonaService";
import { PuntoUbicacionService } from "../../service/PuntoUbicacionService";
import { ConductoresService } from "../../service/ConductoresServices";
import { CombustiblesService } from "../../service/CombustiblesService";
import {
  MAX_DIAS_SCOP,
  SCOP_FUENTE,
  SCOP_MODO,
  ScopService,
  aPedidos,
  diasDelRango,
  filtrarPorPlaca,
  normalizarPlaca,
} from "../../service/ScopService";
import { nombreVendedor, vendedoresDePedidos } from "./vendedoresScop";
import { useAuthStore } from "../../store/authStore";
import { useOperacionStore } from "../../store/operacionStore";
import { useTokenParamsStore } from "../../store/tokenParamsStore";
import {
  PRODUCTOS_SCOP,
  ProductoScop,
  abreviarUnidad,
  calcularPesoTotal,
  mismoCodigo,
  productoScopDe,
  unidadCompatible,
  unidadDePedido,
} from "./productosScop";

export const MOTIVOS_TRASLADO = [
  { id: "01", valor: "Venta" },
  { id: "02", valor: "Compra" },
  { id: "03", valor: "Venta con entrega a terceros" },
  { id: "04", valor: "Traslado entre establecimientos de la misma empresa" },
  { id: "05", valor: "Consignación" },
  { id: "06", valor: "Devolución" },
  { id: "07", valor: "Recojo de bienes transformados" },
  { id: "08", valor: "Importación" },
  { id: "09", valor: "Exportación" },
  { id: "13", valor: "Otros" },
  { id: "14", valor: "Venta sujeta a confirmación del comprador" },
  { id: "17", valor: "Traslado de bienes para transformación" },
  { id: "18", valor: "Traslado emisor itinerante CP" },
];

export const MODALIDADES_TRASLADO: Record<string, string> = {
  "01": "Público",
  "02": "Privado",
};

const MOTIVO_COMPRA = "02";
const CLIENTE_VACIO: Client = { id: 0, numDoc: "", rznSocial: "", tipoDoc: "6" };

/* ---------- Documentos adicionales de la guía rápida ---------- */
export type TipoDocRapido = "81" | "01";

export const DESCRIPCION_DOC: Record<TipoDocRapido, string> = {
  "81": "CODIGO DE AUTORIZACION EMITIDA POR EL SCOP",
  "01": "FACTURA",
};

/** Documento tal como se ve en la pantalla. */
export interface DocRapido {
  /** `auto:<tipo>:<nro original>` si sale de un pedido; `manual:<n>` si se agregó a mano. */
  clave: string;
  tipo: TipoDocRapido;
  tipoDesc: string;
  nro: string;
  /** RUC del emisor: el proveedor que había cuando se eligió el pedido o se agregó el documento. */
  emisor: string;
}

const PATRON_FACTURA = /^[FBE][A-Z0-9]{3}-\d+$/;
const PATRON_SCOP = /^\d+$/;

/** Mismo formato que exige el esquema de documentos adicionales. */
export const validarNroDoc = (tipo: TipoDocRapido, nro: string): string | null => {
  const texto = nro.trim().toUpperCase();
  if (!texto) return "Escribe el número.";
  if (tipo === "01" && !PATRON_FACTURA.test(texto)) return "Formato de factura: F001-123456.";
  if (tipo === "81" && !PATRON_SCOP.test(texto)) return "El código SCOP sólo lleva números.";
  return null;
};

export const claveScop = (p: PedidoScop) => `${p.tipo}:${p.codigoAutorizacion}`;

const esVerdadero = (valor: unknown) =>
  valor === true || valor === 1 || valor === "1" || valor === "true";
const redondear = (n: number) => Math.round(n * 10000) / 10000;
const mismoRuc = (a?: string | null, b?: string | null) =>
  Boolean(a) && (a || "").trim() === (b || "").trim();

/* =========================================================================
 * Carga inicial por pasos
 * ========================================================================= */
export type PasoId = "emision" | "chofer" | "personas" | "llegada" | "productos";
export type EstadoPaso = "pendiente" | "cargando" | "listo" | "aviso" | "error";

export interface PasoCarga {
  id: PasoId;
  titulo: string;
  estado: EstadoPaso;
  /** Motivo del error o del aviso. */
  detalle?: string;
}

const ORDEN_PASOS: PasoId[] = ["emision", "chofer", "personas", "llegada", "productos"];

const TITULOS_PASOS: Record<PasoId, string> = {
  emision: "Punto de emisión, serie y vehículos",
  chofer: "Chofer ligado a tu DNI",
  personas: "Destinatario y proveedores",
  llegada: "Puntos de llegada de la empresa",
  productos: "Combustibles en tu catálogo de productos",
};

const pasosIniciales = (): Record<PasoId, PasoCarga> =>
  ORDEN_PASOS.reduce((acc, id) => {
    acc[id] = { id, titulo: TITULOS_PASOS[id], estado: "pendiente" };
    return acc;
  }, {} as Record<PasoId, PasoCarga>);

/** Convierte cualquier error en un motivo que se pueda mostrar. */
export const describirError = (error: unknown): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Sin conexión a internet.";
  }
  const texto =
    typeof error === "string" ? error : error instanceof Error ? error.message : "";
  if (/network error/i.test(texto)) {
    return "El servidor no respondió (red caída o servidor apagado).";
  }
  return texto || "El servidor devolvió un error inesperado.";
};

/* =========================================================================
 * Conversores
 * ========================================================================= */
type VehiculoOrigen = {
  id?: number;
  placa: string;
  nroCirculacion?: string | null;
  codEmisor?: string | null;
  nroAutorizacion?: string | null;
};

const aVehiculoEnvio = (v: VehiculoOrigen): EnvioVehiculo => ({
  id: v.id ?? 0,
  placa: (v.placa || "").toUpperCase(),
  nroCirculacion: v.nroCirculacion || "",
  codEmisor: v.codEmisor || "",
  nroAutorizacion: v.nroAutorizacion || "",
});

export const aCliente = (p: persona): Client => ({
  id: p.id,
  tipoDoc: p.tipoDoc || ((p.numDoc || "").length === 11 ? "6" : "1"),
  numDoc: p.numDoc,
  rznSocial: (p.rznSocial || "").toUpperCase(),
});

const aDireccion = (p: puntoUbicacion): Direccion => ({
  id: p.id,
  ubigeo: p.ubigeo,
  direccion: (p.direccion || "").toUpperCase(),
  codLocal: p.codLocal || "0000",
  ruc: p.ruc || "",
  rznSocial: (p.rznSocial || "").toUpperCase(),
});

const aChofer = (c: conductor): EnvioChoferes => ({
  id: c.id,
  tipo: "Principal",
  tipoDoc: c.tipoDoc || "1",
  nroDoc: c.nroDoc,
  nombres: c.nombres,
  apellidos: c.apellidos,
  licencia: c.licencia,
});

/**
 * Puntos de ubicación de uno o más RUC (filtro exacto aunque el backend busque
 * parcial). Falla sólo si fallan todas las consultas.
 */
const puntosDeRucs = async (rucs: string[]): Promise<puntoUbicacion[]> => {
  // Una consulta tras otra: el backend atiende de a una petición.
  const respuestas: PromiseSettledResult<any>[] = [];
  for (const ruc of rucs) {
    try {
      respuestas.push({ status: "fulfilled", value: await PuntoUbicacionService.get(`ruc=${encodeURIComponent(ruc)}`) });
    } catch (reason) {
      respuestas.push({ status: "rejected", reason });
    }
  }
  if (respuestas.length > 0 && respuestas.every((r) => r.status === "rejected")) {
    throw (respuestas[0] as PromiseRejectedResult).reason;
  }
  const mapa = new Map<number, puntoUbicacion>();
  respuestas.forEach((r) => {
    if (r.status !== "fulfilled" || !Array.isArray(r.value?.data)) return;
    (r.value.data as puntoUbicacion[]).forEach((p) => {
      if (p?.id && rucs.some((ruc) => mismoRuc(p.ruc, ruc))) mapa.set(p.id, p);
    });
  });
  return Array.from(mapa.values());
};

/**
 * Guía rápida: usa toda la lógica de `useGuiaRemisionForm` (validaciones,
 * guardado, envío, anti-duplicidad, salida) y sólo precarga los datos y arma
 * bienes, documentos y peso a partir de los pedidos SCOP elegidos.
 */
export const useGuiaRapida = () => {
  const api = useGuiaRemisionForm({ precargaAutomatica: false });
  const { formik } = api;
  const values = formik.values;
  const user = useAuthStore((state) => state.user);

  const [avisos, setAvisos] = useState<string[]>([]);
  const avisar = (texto: string) =>
    setAvisos((previos) => (previos.includes(texto) ? previos : [...previos, texto]));

  /* ---------- Carga inicial ---------- */
  const [pasos, setPasos] = useState<Record<PasoId, PasoCarga>>(pasosIniciales);
  const pasosRef = useRef(pasos);
  const cargaIniciada = useRef(false);
  const rucDestinatarioRef = useRef("");

  /* ---------- Datos ---------- */
  const [puntosEmision, setPuntosEmision] = useState<puntoEmision[]>([]);
  const [series, setSeries] = useState<numeracion[]>([]);
  const [personas, setPersonas] = useState<persona[]>([]);
  const [productosBd, setProductosBd] = useState<Record<string, Producto>>({});
  const [choferAutomatico, setChoferAutomatico] = useState(false);

  /* Listas completas: sólo se piden al abrir su selector. */
  const [vehiculos, setVehiculos] = useState<vehiculo[] | null>(null);
  const [conductores, setConductores] = useState<conductor[] | null>(null);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);
  const [cargandoConductores, setCargandoConductores] = useState(false);

  /** Placa -> tiene el check GLP (viene de la serie o de la lista de vehículos). */
  const [glpPorPlaca, setGlpPorPlaca] = useState<Record<string, boolean>>({});

  /* ---------- Proveedor y puntos ---------- */
  /** Proveedor = emisor de la factura = emisor del SCOP. */
  const [proveedor, setProveedor] = useState<persona | null>(null);
  const [puntosPartida, setPuntosPartida] = useState<puntoUbicacion[]>([]);
  const [puntosLlegada, setPuntosLlegada] = useState<puntoUbicacion[]>([]);
  const [cargandoPartida, setCargandoPartida] = useState(false);

  /* ---------- SCOP ---------- */
  /* Un solo tipo por consulta. null = sin marcar: la consulta no sale hasta elegirlo. */
  const [tipoScop, setTipoScop] = useState<TipoScop | null>(null);
  /** Placa elegida cuando la serie trae más de un vehículo secundario. */
  const [placaElegida, setPlacaElegida] = useState("");
  // Los últimos 7 días contando hoy: el portal no acepta rangos más largos.
  const [rango, setRango] = useState(() => ({
    desde: dayjs().subtract(MAX_DIAS_SCOP - 1, "day").format("YYYY-MM-DD"),
    hasta: dayjs().format("YYYY-MM-DD"),
  }));
  /** Todo lo que devolvió la sucursal (sin filtrar por placa, incluidos cerrados). */
  const [pedidosSucursal, setPedidosSucursal] = useState<PedidoScop[]>([]);
  const [desdeCache, setDesdeCache] = useState(false);
  const [cargandoScop, setCargandoScop] = useState(false);
  const [errorScop, setErrorScop] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<PedidoScop[]>([]);
  const [recargaScop, setRecargaScop] = useState(0);
  const consultaScop = useRef(0);
  /** "Volver a consultar" pide datos frescos al portal, sin la caché del backend. */
  const refrescarScop = useRef(false);
  /**
   * Sólo la cisterna GLP consulta sola al abrir el formulario. Con líquidos la
   * consulta se hace cuando el usuario la pide (botón de actualizar).
   */
  const [consultaPedida, setConsultaPedida] = useState(false);
  /** Números de SCOP ya usados en otra guía -> "T001-25" (o "" si no se sabe cuál). */
  const [ocupados, setOcupados] = useState<Record<string, string>>({});
  /** Aviso cuando refrescar o la verificación de uso sueltan pedidos elegidos. */
  const [avisoSeleccion, setAvisoSeleccion] = useState<string | null>(null);
  /** RUC del proveedor que había al marcar cada pedido (clave del SCOP -> RUC). */
  const [emisorPorScop, setEmisorPorScop] = useState<Record<string, string>>({});
  /** Aviso cuando un chip de vendedor no reemplaza al proveedor ya elegido. */
  const [avisoChip, setAvisoChip] = useState<string | null>(null);
  /** Vendedor del portal cuyo proveedor se aplicó; no filtra la lista. */
  const [vendedorElegido, setVendedorElegido] = useState<string | null>(null);
  /** Catálogo de clientes para buscar al vendedor por parecido (se pide una vez). */
  const [clientesCatalogo, setClientesCatalogo] = useState<persona[]>([]);
  const catalogoPedido = useRef(false);

  /* ---------- Agregados y correcciones a mano ---------- */
  const [docsManuales, setDocsManuales] = useState<DocRapido[]>([]);
  /** Número corregido de un documento que salió de un pedido; "" = quitado. */
  const [correcciones, setCorrecciones] = useState<Record<string, string>>({});
  /** Código de producto (tabla SCOP) -> cantidad agregada a mano. */
  const [bienesManuales, setBienesManuales] = useState<Record<string, number>>({});
  const contadorManual = useRef(0);

  /* =========================================================
   *  Serie y vehículos
   * ========================================================= */
  const registrarGlp = (lista: { placa?: string; glp?: unknown }[]) =>
    setGlpPorPlaca((previo) => {
      const siguiente = { ...previo };
      lista.forEach((v) => {
        if (v?.placa) siguiente[normalizarPlaca(v.placa)] = esVerdadero(v.glp);
      });
      return siguiente;
    });

  /** Serie + correlativo + vehículos ligados a la serie. Devuelve un aviso si falta algo. */
  const aplicarSerie = (serie: numeracion, automatico = true): string | void => {
    if (automatico) api.asentarCambiosAutomaticos();
    formik.setFieldValue("datosGenerales.serie", serie.serie);
    formik.setFieldValue("datosGenerales.correlativo", String(Number(serie.numeroActual) + 1));

    if (serie.primario?.placa) {
      const principal = aVehiculoEnvio(serie.primario);
      const origenSecundarios = (serie.secundario || []).filter((v) => v?.placa);
      registrarGlp(origenSecundarios as { placa?: string; glp?: unknown }[]);
      const secundarios = origenSecundarios.map(aVehiculoEnvio);
      formik.setFieldValue("vehiculo", { ...principal, secundarios });
      if (secundarios.length === 0) {
        return `La serie ${serie.serie} no tiene vehículo secundario: el SCOP se consulta con su placa, elígelo en la lista.`;
      }
      return;
    }

    formik.setFieldValue("vehiculo", { ...VehiculoValues });
    return `La serie ${serie.serie} no tiene vehículo asignado: elígelo en la lista.`;
  };

  const cargarSeries = async (idPunto: number, automatico = true): Promise<string | void> => {
    const { data } = await NumeracionService.getNumeracionByIdPuntoEmision(idPunto);
    const lista: numeracion[] = data || [];
    setSeries(lista);

    if (lista.length === 0) {
      if (automatico) api.asentarCambiosAutomaticos();
      formik.setFieldValue("datosGenerales.serie", "");
      formik.setFieldValue("datosGenerales.correlativo", "0");
      return "El punto de emisión no tiene series asignadas.";
    }
    return aplicarSerie(lista[0], automatico);
  };

  /* =========================================================
   *  Pasos de la carga inicial
   * ========================================================= */
  const actualizarPaso = (id: PasoId, cambios: Partial<PasoCarga>) => {
    const siguiente = { ...pasosRef.current, [id]: { ...pasosRef.current[id], ...cambios } };
    pasosRef.current = siguiente;
    setPasos(siguiente);
  };

  /** Una tarea devuelve un aviso (dato faltante) o lanza un error (no se pudo consultar). */
  const ejecutarPaso = async (id: PasoId, tarea: () => Promise<string | void>): Promise<boolean> => {
    actualizarPaso(id, { estado: "cargando", detalle: undefined });
    try {
      const aviso = await tarea();
      if (aviso) {
        actualizarPaso(id, { estado: "aviso", detalle: aviso });
        avisar(aviso);
      } else {
        actualizarPaso(id, { estado: "listo", detalle: undefined });
      }
      return true;
    } catch (error) {
      actualizarPaso(id, { estado: "error", detalle: describirError(error) });
      return false;
    }
  };

  /**
   * Los datos de trabajo se piden al entrar al sistema (operacionStore). Aquí sólo
   * se espera a que terminen, o se piden si por algo no se cargaron.
   */
  const datosDeTrabajo = async () => {
    const store = useOperacionStore.getState();
    if (store.estado === "listo") return store;
    if (store.estado === "cargando") {
      await new Promise<void>((listo) => {
        const dejarDeEscuchar = useOperacionStore.subscribe((estadoActual) => {
          if (estadoActual.estado !== "cargando") {
            dejarDeEscuchar();
            listo();
          }
        });
      });
    } else {
      await useOperacionStore.getState().cargar(user);
    }
    return useOperacionStore.getState();
  };

  const tareaEmision = async (): Promise<string | void> => {
    if (!user?.id) throw "No se encontró el usuario de la sesión.";
    const datos = await datosDeTrabajo();
    if (datos.estado === "error") throw datos.error || "No se pudieron cargar tus datos de emisión.";

    setPuntosEmision(datos.puntos);
    if (datos.puntos.length === 0) return "Tu usuario no tiene puntos de emisión asignados.";
    api.setPuntoEmisionSelected(datos.puntoId ?? datos.puntos[0].id);

    setSeries(datos.series);
    if (!datos.serie) {
      api.asentarCambiosAutomaticos();
      formik.setFieldValue("datosGenerales.serie", "");
      formik.setFieldValue("datosGenerales.correlativo", "0");
      return "El punto de emisión no tiene series asignadas.";
    }
    return aplicarSerie(datos.serie);
  };

  const tareaChofer = async (): Promise<string | void> => {
    const documento = (user?.documento || "").trim();
    if (!documento) return "Tu usuario no tiene DNI registrado: elige el chofer.";
    const chofer: conductor | null = (await datosDeTrabajo()).conductor;
    if (!chofer) return `Tu DNI ${documento} no está registrado como conductor: elige el chofer.`;
    api.asentarCambiosAutomaticos();
    api.onChoferesChange([aChofer(chofer)]);
    setChoferAutomatico(true);
  };

  /* Destinatario: misma regla que el "por defecto" de las otras guías. */
  const tareaPersonas = async (): Promise<string | void> => {
    const { data } = await PersonaService.get("fav=1");
    const lista: persona[] = data || [];
    setPersonas(lista);
    const empresa = lista.find((p) => Number(p.isCompany) === 1 || esVerdadero(p.isCompany));
    if (!empresa) {
      return "No hay una persona favorita marcada como empresa: no se puede asignar el destinatario.";
    }
    rucDestinatarioRef.current = (empresa.numDoc || "").trim();
    api.asentarCambiosAutomaticos();
    api.onDestinatarioChange(aCliente(empresa));
  };

  /* Llegada: puntos con nuestro RUC o el del destinatario. */
  const tareaLlegada = async (): Promise<string | void> => {
    let rucEmpresa = (useTokenParamsStore.getState().params?.ruc || "").trim();
    if (!rucEmpresa) {
      try {
        await useTokenParamsStore.getState().getSunatParams();
        rucEmpresa = (useTokenParamsStore.getState().params?.ruc || "").trim();
      } catch {
        /* se sigue con el RUC del destinatario */
      }
    }

    const rucs = Array.from(new Set([rucEmpresa, rucDestinatarioRef.current].filter(Boolean)));
    if (rucs.length === 0) return "No se conoce el RUC de la empresa ni el del destinatario.";

    const lista = await puntosDeRucs(rucs);
    setPuntosLlegada(lista);
    if (lista.length === 0) return `No hay puntos de ubicación con el RUC ${rucs.join(" ni ")}.`;

    // La llegada nunca se precarga: la elige el usuario, también con cisterna GLP.
  };

  /**
   * Nada que ver con el portal SCOP: son los combustibles de la tabla
   * `PRODUCTOS_SCOP` buscados en NUESTRO catálogo, para convertir el nombre que
   * trae un pedido en un bien de la guía. Se leen al entrar al sistema
   * (operacionStore), así que aquí normalmente no hay ninguna petición.
   */
  const tareaProductos = async (): Promise<string | void> => {
    const guardados = (await datosDeTrabajo()).productos;
    const productos = Object.keys(guardados).length > 0 ? guardados : (await CombustiblesService.cargar()).productos;
    setProductosBd(productos);

    const faltan = PRODUCTOS_SCOP.filter((p) => !productos[p.codigo]).map((p) => p.codigo);
    if (faltan.length > 0) return `Códigos que no están en tu catálogo de productos: ${faltan.join(", ")}.`;
  };

  /**
   * Un paso tras otro, en el orden de ORDEN_PASOS: el backend atiende de a una
   * petición, así que en paralelo sólo hacían cola. La emisión va primero porque
   * define si la cisterna es GLP; la llegada va después del destinatario.
   * Con `soloFallidos` reintenta únicamente lo que falló.
   */
  const cargarInicial = async (soloFallidos = false) => {
    const tareas: Record<PasoId, () => Promise<string | void>> = {
      emision: tareaEmision,
      chofer: tareaChofer,
      personas: tareaPersonas,
      llegada: tareaLlegada,
      productos: tareaProductos,
    };

    for (const id of ORDEN_PASOS) {
      if (soloFallidos && pasosRef.current[id].estado !== "error") continue;

      if (id === "llegada" && pasosRef.current.personas.estado === "error") {
        actualizarPaso("llegada", {
          estado: "error",
          detalle: "Depende del destinatario, que no se pudo cargar.",
        });
        continue;
      }

      await ejecutarPaso(id, tareas[id]);
    }
  };

  /* Fechas de hoy; compra en transporte privado; bultos siempre 0. Luego la carga. */
  useEffect(() => {
    // StrictMode monta dos veces en desarrollo: la carga se hace una sola vez.
    if (cargaIniciada.current) return;
    cargaIniciada.current = true;

    const hoy = dayjs().format("YYYY-MM-DD");
    api.asentarCambiosAutomaticos();
    formik.setFieldValue("datosGenerales.fechaEmision", hoy);
    formik.setFieldValue("envio", {
      ...EnvioValues,
      codTraslado: MOTIVO_COMPRA,
      desTraslado: "Compra",
      modTraslado: TRANSPORTE_PRIVADO,
      fecTraslado: hoy,
      indicadores: [],
      pesoTotal: 0,
      numBultos: 0,
    });

    cargarInicial();
  }, []);

  const pasosLista = ORDEN_PASOS.map((id) => pasos[id]);
  const cargaEnCurso = pasosLista.some((p) => p.estado === "pendiente" || p.estado === "cargando");
  const hayErroresCarga = pasosLista.some((p) => p.estado === "error");

  /* =========================================================
   *  Listas bajo demanda
   * ========================================================= */
  const cargarVehiculos = async () => {
    if (vehiculos || cargandoVehiculos) return;
    setCargandoVehiculos(true);
    try {
      const { data } = await VehiculoService.get("");
      const lista: vehiculo[] = data || [];
      setVehiculos(lista);
      registrarGlp(lista);
    } catch (error) {
      avisar(`No se pudo cargar la lista de vehículos: ${describirError(error)}`);
    } finally {
      setCargandoVehiculos(false);
    }
  };

  const cargarConductores = async () => {
    if (conductores || cargandoConductores) return;
    setCargandoConductores(true);
    try {
      const { data } = await ConductoresService.get("");
      setConductores(data || []);
    } catch (error) {
      avisar(`No se pudo cargar la lista de conductores: ${describirError(error)}`);
    } finally {
      setCargandoConductores(false);
    }
  };

  /* =========================================================
   *  Proveedor -> tercero y partida
   * ========================================================= */
  useEffect(() => {
    if (!proveedor && !values.tercero?.numDoc) return;
    api.onProveedorChange(proveedor ? aCliente(proveedor) : { ...CLIENTE_VACIO });
  }, [proveedor?.id]);

  /*
   * Cambiar de proveedor no toca lo ya elegido: cada pedido conserva el RUC con
   * el que se marcó. La pantalla lo advierte con `avisoProveedor`.
   */

  /* Partida: los puntos del RUC del proveedor. */
  useEffect(() => {
    const ruc = (proveedor?.numDoc || "").trim();
    if (!ruc) {
      setPuntosPartida([]);
      if (values.partida?.direccion) api.onPartidaChange({ ...initialValues.partida });
      return;
    }

    let cancelado = false;
    setCargandoPartida(true);
    puntosDeRucs([ruc])
      .then((lista) => {
        if (cancelado) return;
        setPuntosPartida(lista);
        if (lista.some((p) => p.id === values.partida?.id)) return;
        api.onPartidaChange(lista[0] ? aDireccion(lista[0]) : { ...initialValues.partida });
      })
      .catch((error) => {
        if (!cancelado) avisar(`No se pudieron cargar los puntos del proveedor: ${describirError(error)}`);
      })
      .finally(() => {
        if (!cancelado) setCargandoPartida(false);
      });

    return () => {
      cancelado = true;
    };
  }, [proveedor?.numDoc]);

  /* =========================================================
   *  Parámetros de la búsqueda SCOP
   * ========================================================= */

  /* Placa: siempre la de un vehículo secundario (la cisterna), nunca la del principal. */
  const placasSecundarias = useMemo(
    () =>
      Array.from(
        new Set((values.vehiculo?.secundarios || []).map((v) => normalizarPlaca(v.placa)).filter(Boolean))
      ),
    [values.vehiculo]
  );
  const placaScop = placasSecundarias.includes(placaElegida) ? placaElegida : placasSecundarias[0] || "";
  const secundarioEsGlp = Boolean(placaScop && glpPorPlaca[placaScop]);

  /*
   * Sucursal: si la cisterna tiene el check GLP, es su misma placa; si no, el id
   * del punto de llegada (el servicio la pide como texto).
   */
  const sucursal = secundarioEsGlp ? placaScop : values.llegada?.id ? String(values.llegada.id) : "";

  /*
   * El tipo lo define la cisterna: GLP si tiene el check, si no Líquidos. Con GLP
   * la consulta sale sola (sucursal = placa); con Líquidos espera a que se elija
   * el punto de llegada. Sin vehículo secundario no se marca nada.
   */
  useEffect(() => {
    setTipoScop(placaScop ? (secundarioEsGlp ? "glp" : "liquido") : null);
  }, [placaScop, secundarioEsGlp]);

  /* =========================================================
   *  Pedidos SCOP
   * ========================================================= */
  useEffect(() => {
    /*
     * Fuente "temporal" (por defecto): lo cargado en guiasapi para la placa de la
     * cisterna. Basta la placa; sale sola, también con líquidos.
     *
     * Fuente "portal": recién al terminar la carga inicial, con tipo marcado y
     * sucursal. La placa no entra en la consulta: se piden todos los pedidos y se
     * filtran en pantalla. Si la cisterna no es GLP, no se consulta hasta que el
     * usuario lo pida.
     */
    const temporal = SCOP_FUENTE === "temporal";
    const tipoActual: TipoScop = tipoScop || (secundarioEsGlp ? "glp" : "liquido");
    // Líquidos: los SCOP se filtran también por el punto de llegada; sin él no se carga
    const idLlegada = values.llegada?.id || null;
    // Fuente "manual": nunca se consulta; todo se agrega a mano.
    const faltaAlgo = SCOP_FUENTE === "manual"
      ? true
      : temporal
      ? cargaEnCurso || !placaScop || (tipoActual === "liquido" && !idLlegada)
      : cargaEnCurso || !tipoScop || !sucursal || (!secundarioEsGlp && !consultaPedida);

    if (faltaAlgo) {
      consultaScop.current++;
      setPedidosSucursal([]);
      setDesdeCache(false);
      setErrorScop(null);
      setCargandoScop(false);
      return;
    }

    const ticket = ++consultaScop.current;
    const controlador = new AbortController();
    const refrescar = refrescarScop.current;
    refrescarScop.current = false;
    // Una búsqueda nueva no muestra lo de la anterior; "volver a consultar" sí lo mantiene.
    if (!refrescar) setPedidosSucursal([]);
    setAvisoSeleccion(null);
    setCargandoScop(true);
    setErrorScop(null);

    const pedir: Promise<{ todos: PedidoScop[]; cache: boolean }> = temporal
      ? ScopService.temporales(placaScop, tipoActual, api.idDespatch, idLlegada, { signal: controlador.signal }).then((todos) => ({ todos, cache: false }))
      : ScopService.consultar(
          {
            sucursal,
            fecha_inicio: rango.desde,
            fecha_fin: rango.hasta,
            para_liquido: tipoScop === "liquido",
            para_glp: tipoScop === "glp",
            refrescar,
          },
          { signal: controlador.signal }
        ).then((respuesta) => ({ todos: aPedidos(respuesta), cache: Boolean(respuesta.desdeCache) }));

    pedir
      .then(({ todos, cache }) => {
        if (ticket !== consultaScop.current) return;
        setPedidosSucursal(todos);
        setDesdeCache(cache);

        /*
         * Refrescar conserva lo elegido, pero con los datos nuevos: si un pedido
         * cambió de volumen se actualiza, y si se cerró, anuló o ya no aparece, se suelta.
         */
        if (refrescar) {
          const vigentes = new Map(todos.filter((p) => p.disponible).map((p) => [claveScop(p), p]));
          setSeleccion((previa) => {
            const quedan = previa.filter((p) => vigentes.has(claveScop(p))).map((p) => vigentes.get(claveScop(p)) as PedidoScop);
            const sueltos = previa.filter((p) => !vigentes.has(claveScop(p)));
            if (sueltos.length > 0) {
              setAvisoSeleccion(
                `Se quitó ${sueltos.map((p) => p.codigoAutorizacion).join(", ")}: ya no está disponible en el portal (cerrado, anulado o sin registro).`
              );
            }
            return sueltos.length === 0 && quedan.every((p, i) => p === previa[i]) ? previa : quedan;
          });
        }
      })
      .catch((error) => {
        if (ticket !== consultaScop.current) return;
        // Si falla al refrescar se mantiene la lista anterior (y lo elegido); si no, se vacía.
        if (!refrescar) {
          setPedidosSucursal([]);
          setDesdeCache(false);
        }
        setErrorScop(describirError(error));
      })
      .finally(() => {
        if (ticket === consultaScop.current) setCargandoScop(false);
      });

    // Si cambia la búsqueda o se sale de la página, se abandona la consulta anterior.
    return () => controlador.abort();
  }, [cargaEnCurso, tipoScop, rango.desde, rango.hasta, sucursal, secundarioEsGlp, consultaPedida, recargaScop, placaScop, api.idDespatch, values.llegada?.id]);

  /* Pedidos de la placa elegida; los cerrados y anulados no se ofrecen. */
  const pedidosPlaca = useMemo(() => filtrarPorPlaca(pedidosSucursal, placaScop), [pedidosSucursal, placaScop]);
  const disponiblesPlaca = useMemo(() => pedidosPlaca.filter((p) => p.disponible), [pedidosPlaca]);
  const noDisponibles = pedidosPlaca.length - disponiblesPlaca.length;

  /*
   * Vendedor del pedido (GLP: "Vendedor Razón Social"; líquidos: "Prov. Producto").
   * Se busca su cliente por parecido y la lista se filtra por el vendedor elegido.
   * El proveedor que se elija a mano no cambia esta lista.
   */
  useEffect(() => {
    if (disponiblesPlaca.length === 0 || catalogoPedido.current) return;
    catalogoPedido.current = true;
    PersonaService.get("")
      .then(({ data }) => setClientesCatalogo(Array.isArray(data) ? data : []))
      .catch((error) => {
        // Sin catálogo se buscan sólo entre los favoritos ya cargados.
        catalogoPedido.current = false;
        console.warn("No se pudo cargar el catálogo de clientes:", error);
      });
  }, [disponiblesPlaca.length]);

  const clientesParaBuscar = clientesCatalogo.length > 0 ? clientesCatalogo : personas;
  const vendedores = useMemo(
    () => vendedoresDePedidos(disponiblesPlaca, clientesParaBuscar),
    [disponiblesPlaca, clientesParaBuscar]
  );

  /* Con un solo vendedor se elige solo; si el elegido ya no está, se suelta. */
  useEffect(() => {
    if (vendedores.length === 1) {
      setVendedorElegido(vendedores[0].nombre);
      return;
    }
    if (vendedorElegido !== null && !vendedores.some((v) => v.nombre === vendedorElegido)) {
      setVendedorElegido(null);
    }
  }, [vendedores, vendedorElegido]);

  const vendedorActual = vendedores.find((v) => v.nombre === vendedorElegido) || null;

  /*
   * El vendedor sólo carga el proveedor cuando todavía no hay uno y se sabe cuál
   * es; nunca reemplaza al que ya está elegido. No filtra la lista.
   */
  useEffect(() => {
    if (!vendedorActual?.cliente || proveedor) return;
    setProveedor(vendedorActual.cliente);
  }, [vendedorElegido, vendedorActual?.cliente?.id, proveedor?.id]);

  const avisoVendedor =
    vendedorActual && !vendedorActual.cliente
      ? `No se sabe qué cliente es "${vendedorActual.etiqueta}": elige el proveedor antes de marcar pedidos.`
      : null;

  /* El chip elegido filtra la lista; sin chip elegido se ven los de todos. */
  const pedidos = useMemo(
    () =>
      vendedorElegido === null
        ? disponiblesPlaca
        : disponiblesPlaca.filter((p) => nombreVendedor(p) === vendedorElegido),
    [disponiblesPlaca, vendedorElegido]
  );

  /*
   * Números ya usados en otra guía (se consulta al backend cada vez que cambia la
   * lista). Si alguno estaba elegido, se suelta. Un fallo aquí no bloquea: al
   * guardar, el backend igual rechaza (409) un número repetido.
   */
  const codigosVisibles = pedidos.map((p) => p.codigoAutorizacion).join("|");
  useEffect(() => {
    const numeros = codigosVisibles ? codigosVisibles.split("|") : [];
    if (numeros.length === 0) {
      setOcupados({});
      return;
    }
    const controlador = new AbortController();
    ScopService.disponibilidad(numeros, api.idDespatch, { signal: controlador.signal })
      .then((usos) => {
        const mapa: Record<string, string> = {};
        Object.values(usos).forEach((uso) => {
          if (!uso.disponible) mapa[uso.nroScop] = uso.guia || "";
        });
        setOcupados(mapa);
        setSeleccion((previa) => {
          const sueltos = previa.filter((p) => p.codigoAutorizacion in mapa);
          if (sueltos.length === 0) return previa;
          setAvisoSeleccion(
            `Se quitó ${sueltos
              .map((p) => (mapa[p.codigoAutorizacion] ? `${p.codigoAutorizacion} (guía ${mapa[p.codigoAutorizacion]})` : p.codigoAutorizacion))
              .join(", ")}: ya está usado en otra guía.`
          );
          return previa.filter((p) => !(p.codigoAutorizacion in mapa));
        });
      })
      .catch((error) => {
        if (controlador.signal.aborted) return;
        console.warn("No se pudo verificar si los SCOP ya están usados:", error);
      });
    return () => controlador.abort();
  }, [codigosVisibles, api.idDespatch]);

  /*
   * Cambió la búsqueda (placa, tipo, llegada/sucursal o fechas): se descartan los
   * resultados anteriores, lo elegido, los documentos y lo agregado a mano.
   * "Volver a consultar" sin cambiar nada conserva todo.
   */
  useEffect(() => {
    // Otra placa no vuelve a consultar (sólo refiltra), pero sí descarta lo elegido.
    setSeleccion([]);
    setAvisoSeleccion(null);
    setVendedorElegido(null);
    // Otra búsqueda con líquidos vuelve a esperar a que el usuario la pida.
    setConsultaPedida(false);
    setDocsManuales([]);
    setCorrecciones({});
    setBienesManuales({});
  }, [placaScop, tipoScop, sucursal, rango.desde, rango.hasta]);

  /*
   * Al cambiar el motivo cambia el producto del GLP (kilos en compras, galones en
   * traslados y ventas): se sueltan los pedidos cuya unidad ya no corresponde.
   */
  useEffect(() => {
    setSeleccion((previa) => {
      const sueltos = previa.filter((p) => !unidadCompatible(p, values.envio.codTraslado));
      if (sueltos.length === 0) return previa;
      setAvisoSeleccion(
        `Se quitó ${sueltos.map((p) => p.codigoAutorizacion).join(", ")}: con este motivo el producto no se registra en esa unidad.`
      );
      return previa.filter((p) => unidadCompatible(p, values.envio.codTraslado));
    });
  }, [values.envio.codTraslado]);

  /*
   * Los documentos de un pedido quedan con el RUC del proveedor que había al
   * marcarlo. Si después se cambia de proveedor, se avisa en vez de reescribirlos.
   */
  const rucsDeSeleccion = Array.from(
    new Set(seleccion.map((p) => emisorPorScop[claveScop(p)]).filter(Boolean))
  );
  const avisoProveedor =
    proveedor?.numDoc && rucsDeSeleccion.some((ruc) => ruc !== proveedor.numDoc)
      ? `Los ${seleccion.length} SCOP ya elegidos conservan el RUC del proveedor anterior (${rucsDeSeleccion.join(
          ", "
        )}). Para emitirlos con ${proveedor.rznSocial}, quítalos y vuelve a elegirlos.`
      : null;

  const estaSeleccionado = (p: PedidoScop) => seleccion.some((s) => claveScop(s) === claveScop(p));

  const alternarPedido = (p: PedidoScop) =>
    setSeleccion((previa) => {
      if (previa.some((s) => claveScop(s) === claveScop(p))) {
        return previa.filter((s) => claveScop(s) !== claveScop(p));
      }
      // No se marca un número usado en otra guía, ni uno cuya unidad no corresponde
      // al motivo, ni ninguno sin proveedor (es el emisor de sus documentos).
      if (
        p.codigoAutorizacion in ocupados ||
        !unidadCompatible(p, values.envio.codTraslado) ||
        !proveedor?.numDoc
      ) {
        return previa;
      }
      // El RUC queda fijado: cambiar de proveedor después no reescribe estos documentos.
      setEmisorPorScop((previos) => ({ ...previos, [claveScop(p)]: proveedor.numDoc }));
      return [...previa, p];
    });

  /* =========================================================
   *  Bienes: pedidos elegidos + agregados a mano
   * ========================================================= */
  useEffect(() => {
    const deseados = new Map<string, Detail>();

    const sumar = (producto: ProductoScop, cantidad: number) => {
      const bd = productosBd[producto.codigo];
      const codigo = String(bd?.codigo || producto.codigo).toUpperCase();
      const previo = deseados.get(codigo);
      if (previo) {
        previo.cantidad = redondear(Number(previo.cantidad) + cantidad);
        return;
      }
      deseados.set(codigo, {
        id: bd?.id ?? 0,
        codigo,
        descripcion: (bd?.descripcion || producto.descripcion).toUpperCase(),
        unidad: bd?.unidad || producto.unidad,
        codProdSunat: bd?.codProdSunat || producto.codProdSunat || "",
        cantidad: redondear(cantidad),
        atributos: null,
      });
    };

    seleccion.forEach((pedido) => {
      // El motivo decide el producto cuando hay dos (GLP en kilos o en galones).
      const producto = productoScopDe(pedido.producto, values.envio.codTraslado);
      if (producto) sumar(producto, pedido.volumen);
    });
    Object.entries(bienesManuales).forEach(([codigo, cantidad]) => {
      const producto = PRODUCTOS_SCOP.find((p) => p.codigo === codigo);
      if (producto && cantidad > 0) sumar(producto, cantidad);
    });

    const actuales: Detail[] = values.details || [];
    deseados.forEach((detalle) => {
      const actual = actuales.find((a) => a.codigo === detalle.codigo);
      if (!actual) api.onNuevoDetalle(detalle);
      else if (Number(actual.cantidad) !== detalle.cantidad) api.onCambiarCantidadDetalle(actual, detalle.cantidad);
    });
    actuales.forEach((actual) => {
      if (!deseados.has(actual.codigo)) api.onEliminarDetalle(actual);
    });
  }, [seleccion, bienesManuales, productosBd, values.envio.codTraslado]);

  /* =========================================================
   *  Documentos: SCOP + factura de cada pedido, con correcciones, más los manuales
   * ========================================================= */
  const docsVista = useMemo<DocRapido[]>(() => {
    const lista: DocRapido[] = [];
    const vistos = new Set<string>();
    const agregar = (doc: DocRapido) => {
      const clave = `${doc.tipo}|${doc.nro.toUpperCase()}`;
      if (!doc.nro || vistos.has(clave)) return;
      vistos.add(clave);
      lista.push(doc);
    };

    seleccion.forEach((pedido) => {
      // El emisor es el proveedor que había al marcar el pedido, no el actual.
      const emisor = emisorPorScop[claveScop(pedido)] || proveedor?.numDoc || "";
      const claveScopDoc = `auto:81:${pedido.codigoAutorizacion}`;
      agregar({
        clave: claveScopDoc,
        tipo: "81",
        tipoDesc: DESCRIPCION_DOC["81"],
        nro: correcciones[claveScopDoc] ?? pedido.codigoAutorizacion,
        emisor,
      });
      if (pedido.factura) {
        const claveFactura = `auto:01:${pedido.factura}`;
        agregar({
          clave: claveFactura,
          tipo: "01",
          tipoDesc: DESCRIPCION_DOC["01"],
          nro: correcciones[claveFactura] ?? pedido.factura,
          emisor,
        });
      }
    });
    docsManuales.forEach(agregar);

    return lista;
  }, [seleccion, correcciones, docsManuales, emisorPorScop, proveedor?.numDoc]);

  useEffect(() => {
    const deseados = new Map<string, AddDoc>();
    docsVista.forEach((d) => {
      if (!d.emisor) return;
      const doc: AddDoc = { tipo: d.tipo, tipoDesc: d.tipoDesc, nro: d.nro, emisor: d.emisor };
      deseados.set(`${doc.emisor}|${doc.nro}`, doc);
    });

    const actuales: AddDoc[] = values.addDocs || [];
    actuales.forEach((actual) => {
      if (!deseados.has(`${actual.emisor}|${actual.nro}`)) api.onEliminarAddDoc(actual);
    });
    deseados.forEach((doc, clave) => {
      if (!actuales.some((a) => `${a.emisor}|${a.nro}` === clave)) api.onNuevoAddDoc(doc);
    });
  }, [docsVista]);

  /*
   * Peso total calculado (entero). Se mantiene al día con los bienes salvo que el
   * usuario lo escriba a mano; ahí manda su valor hasta que pida recalcularlo.
   * Bultos siempre 0.
   */
  const pesoCalculado = useMemo(() => calcularPesoTotal(values.details || []), [values.details]);
  const [pesoManual, setPesoManual] = useState(false);

  useEffect(() => {
    if (!pesoManual && Number(values.envio.pesoTotal) !== pesoCalculado.peso) {
      formik.setFieldValue("envio.pesoTotal", pesoCalculado.peso);
    }
    if (Number(values.envio.numBultos) !== 0) {
      formik.setFieldValue("envio.numBultos", 0);
    }
  }, [pesoManual, pesoCalculado.peso, values.envio.pesoTotal, values.envio.numBultos]);

  /** Peso escrito a mano; se guarda como entero, igual que el calculado. */
  const editarPeso = (valor: string) => {
    setPesoManual(true);
    const numero = Math.max(0, Math.round(Number(valor.replace(",", ".")) || 0));
    formik.setFieldValue("envio.pesoTotal", numero);
  };

  /** Vuelve al peso que sale de los bienes. */
  const restaurarPeso = () => {
    setPesoManual(false);
    formik.setFieldValue("envio.pesoTotal", pesoCalculado.peso);
  };

  /* =========================================================
   *  Agregar, corregir y quitar a mano
   * ========================================================= */
  const yaEstaEnLista = (tipo: TipoDocRapido, nro: string, excepto?: string) =>
    docsVista.some((d) => d.clave !== excepto && d.tipo === tipo && d.nro.toUpperCase() === nro);

  /** Devuelve un mensaje si no se pudo agregar. */
  const agregarDocManual = (tipo: TipoDocRapido, nro: string): string | null => {
    if (!proveedor) return "Elige primero el proveedor: es el emisor del documento.";
    const error = validarNroDoc(tipo, nro);
    if (error) return error;
    const texto = nro.trim().toUpperCase();
    if (yaEstaEnLista(tipo, texto)) return "Ese documento ya está en la lista.";
    contadorManual.current += 1;
    setDocsManuales((previos) => [
      ...previos,
      {
        clave: `manual:${contadorManual.current}`,
        tipo,
        tipoDesc: DESCRIPCION_DOC[tipo],
        nro: texto,
        emisor: proveedor.numDoc,
      },
    ]);
    return null;
  };

  /** Corrige el número de una factura o SCOP; si sale de un pedido, la corrección se recuerda. */
  const corregirDoc = (clave: string, nro: string): string | null => {
    const doc = docsVista.find((d) => d.clave === clave);
    if (!doc) return null;
    const error = validarNroDoc(doc.tipo, nro);
    if (error) return error;
    const texto = nro.trim().toUpperCase();
    if (yaEstaEnLista(doc.tipo, texto, clave)) return "Ese documento ya está en la lista.";
    if (clave.startsWith("auto:")) setCorrecciones((previas) => ({ ...previas, [clave]: texto }));
    else setDocsManuales((previos) => previos.map((d) => (d.clave === clave ? { ...d, nro: texto } : d)));
    return null;
  };

  const quitarDoc = (clave: string) => {
    if (clave.startsWith("auto:")) setCorrecciones((previas) => ({ ...previas, [clave]: "" }));
    else setDocsManuales((previos) => previos.filter((d) => d.clave !== clave));
  };

  const agregarProductoManual = (codigo: string, cantidad: number): string | null => {
    if (!PRODUCTOS_SCOP.some((p) => p.codigo === codigo)) return "Elige un producto.";
    if (!(cantidad > 0)) return "La cantidad debe ser mayor a 0.";
    setBienesManuales((previos) => ({ ...previos, [codigo]: redondear((previos[codigo] || 0) + cantidad) }));
    return null;
  };

  /** Quitar un bien suelta también los pedidos de ese producto y lo agregado a mano. */
  const quitarBien = (detalle: Detail) => {
    const producto = PRODUCTOS_SCOP.find((p) => mismoCodigo(p.codigo, detalle.codigo));
    if (producto) {
      setBienesManuales((previos) => {
        const siguiente = { ...previos };
        delete siguiente[producto.codigo];
        return siguiente;
      });
      setSeleccion((previa) =>
        previa.filter(
          (pedido) => productoScopDe(pedido.producto, values.envio.codTraslado)?.codigo !== producto.codigo
        )
      );
    }
    api.onEliminarDetalle(detalle);
  };

  /* =========================================================
   *  Cambios del usuario
   * ========================================================= */
  /** Volumen elegido por unidad del SCOP (normalmente una sola: galones o kilos). */
  const totalesSeleccion = useMemo(() => {
    const porUnidad = new Map<string, number>();
    seleccion.forEach((p) => {
      const unidad = abreviarUnidad(unidadDePedido(p));
      porUnidad.set(unidad, (porUnidad.get(unidad) || 0) + p.volumen);
    });
    return Array.from(porUnidad, ([unidad, total]) => ({ unidad, total: redondear(total) }));
  }, [seleccion]);

  /** Cambia una fecha y ajusta la otra para no pasar del máximo que acepta el portal. */
  const cambiarRango = (campo: "desde" | "hasta", valor: string) => {
    if (!valor) return;
    setRango((previo) => {
      let desde = campo === "desde" ? valor : previo.desde;
      let hasta = campo === "hasta" ? valor : previo.hasta;
      if (dayjs(hasta).isBefore(dayjs(desde), "day")) {
        if (campo === "desde") hasta = desde;
        else desde = hasta;
      }
      if (diasDelRango(desde, hasta) > MAX_DIAS_SCOP) {
        if (campo === "desde") hasta = dayjs(desde).add(MAX_DIAS_SCOP - 1, "day").format("YYYY-MM-DD");
        else desde = dayjs(hasta).subtract(MAX_DIAS_SCOP - 1, "day").format("YYYY-MM-DD");
      }
      return { desde, hasta };
    });
  };

  const elegirPuntoEmision = async (id: number) => {
    api.setPuntoEmisionSelected(id);
    // El header muestra los mismos datos: se mantiene al día.
    void useOperacionStore.getState().elegirPunto(id);
    try {
      const aviso = await cargarSeries(id, false);
      if (aviso) avisar(aviso);
    } catch (error) {
      avisar(`No se pudieron cargar las series: ${describirError(error)}`);
    }
  };

  const elegirSerie = (serie: string) => {
    const encontrada = series.find((s) => s.serie === serie);
    if (!encontrada) return;
    useOperacionStore.getState().elegirSerie(encontrada);
    const aviso = aplicarSerie(encontrada, false);
    if (aviso) avisar(aviso);
  };

  const elegirProveedor = (id: number | null) => {
    setAvisoChip(null);
    setProveedor(personas.find((p) => p.id === id) || null);
  };

  /**
   * Chip de vendedor: filtra la lista por sus pedidos y, si todavía no hay
   * proveedor, carga su cliente. Nunca reemplaza al proveedor ya elegido: en ese
   * caso filtra igual y avisa por qué no lo cambió. Tocarlo de nuevo quita el filtro.
   */
  const elegirVendedor = (nombre: string | null) => {
    const siguiente = nombre === vendedorElegido ? null : nombre;
    setVendedorElegido(siguiente);

    const vendedor = vendedores.find((v) => v.nombre === siguiente);
    if (!vendedor || !proveedor) {
      setAvisoChip(null);
      return;
    }

    if (vendedor.cliente && vendedor.cliente.id !== proveedor.id) {
      setAvisoChip(
        `Ya tienes elegido el proveedor ${proveedor.rznSocial}. Para usar ${vendedor.cliente.rznSocial}, cámbialo en el campo Proveedor.`
      );
      return;
    }
    if (!vendedor.cliente) {
      setAvisoChip(
        `No se sabe qué cliente es "${vendedor.etiqueta}": se deja el proveedor ${proveedor.rznSocial} que ya tenías.`
      );
      return;
    }
    setAvisoChip(null);
  };

  const elegirMotivo = (id: string) => {
    formik.setFieldValue("envio.codTraslado", id);
    formik.setFieldValue("envio.desTraslado", MOTIVOS_TRASLADO.find((m) => m.id === id)?.valor || "");
  };

  const elegirChofer = (id: number) => {
    const chofer = (conductores || []).find((c) => c.id === id);
    if (!chofer) return;
    api.onChoferesChange([aChofer(chofer)]);
    setChoferAutomatico(false);
  };

  const elegirVehiculoPrincipal = (id: number) => {
    const elegido = (vehiculos || []).find((v) => v.id === id);
    if (!elegido) return;
    const principal = aVehiculoEnvio(elegido);
    // La misma placa no puede ir de principal y de secundaria: se quita de las secundarias
    const secundarios = (values.vehiculo?.secundarios || []).filter((s) => s.id !== principal.id);
    formik.setFieldValue("vehiculo", { ...principal, secundarios });
  };

  const elegirVehiculoSecundario = (id: number | null) => {
    const elegido = (vehiculos || []).find((v) => v.id === id);
    if (elegido && elegido.id === values.vehiculo?.id) {
      avisar(`La placa ${elegido.placa} ya es el vehículo principal: elige otra cisterna.`);
      return;
    }
    if (elegido) registrarGlp([elegido]);
    api.onVehiculosSecundariosChange(elegido ? [aVehiculoEnvio(elegido)] : []);
  };

  const elegirPartida = (id: number) => {
    const punto = puntosPartida.find((p) => p.id === id);
    if (punto) api.onPartidaChange(aDireccion(punto));
  };

  const elegirLlegada = (id: number) => {
    const punto = puntosLlegada.find((p) => p.id === id);
    if (punto) api.onLlegadaChange(aDireccion(punto));
  };

  return {
    api,
    avisos,

    pasosLista,
    cargaEnCurso,
    hayErroresCarga,
    reintentarCarga: () => cargarInicial(true),

    puntosEmision,
    series,
    personas,
    vehiculos: vehiculos || [],
    conductores: conductores || [],
    cargandoVehiculos,
    cargandoConductores,
    cargarVehiculos,
    cargarConductores,
    choferAutomatico,

    proveedor,
    puntosPartida,
    puntosLlegada,
    cargandoPartida,
    sucursal,
    pesoCalculado,
    pesoManual,
    editarPeso,
    restaurarPeso,

    tipoScop,
    setTipoScop,
    placaScop,
    desdeCache,
    ocupados,
    vendedores,
    vendedorElegido,
    vendedorActual,
    avisoVendedor,
    avisoProveedor,
    elegirVendedor,
    avisoChip,
    cerrarAvisoChip: () => setAvisoChip(null),
    avisoSeleccion,
    cerrarAvisoSeleccion: () => setAvisoSeleccion(null),
    setPlacaScop: setPlacaElegida,
    placasSecundarias,
    secundarioEsGlp,
    rango,
    cambiarRango,
    modoScop: SCOP_MODO,
    /** "temporal": SCOP cargados en guiasapi por placa; "portal": consulta directa. */
    fuenteScop: SCOP_FUENTE,
    pedidos,
    noDisponibles,
    cargandoScop,
    errorScop,
    consultaPedida,
    /** Consulta o vuelve a consultar el portal (con líquidos es la única forma). */
    recargarScop: () => {
      refrescarScop.current = true;
      setConsultaPedida(true);
      setRecargaScop((n) => n + 1);
    },
    seleccion,
    totalesSeleccion,
    estaSeleccionado,
    alternarPedido,

    docsVista,
    agregarDocManual,
    corregirDoc,
    quitarDoc,
    agregarProductoManual,
    quitarBien,

    elegirPuntoEmision,
    elegirSerie,
    elegirProveedor,
    elegirMotivo,
    elegirChofer,
    elegirVehiculoPrincipal,
    elegirVehiculoSecundario,
    elegirPartida,
    elegirLlegada,
  };
};

export type GuiaRapidaApi = ReturnType<typeof useGuiaRapida>;

/** Cuerpo que recibe la consulta de pedidos SCOP. */
export interface ScopConsulta {
  sucursal: string;
  /** YYYY-MM-DD */
  fecha_inicio: string;
  /** YYYY-MM-DD */
  fecha_fin: string;
  para_liquido: boolean;
  para_glp: boolean;
  /**
   * Opcional: la consulta al portal no depende de la placa. La guía rápida no la
   * envía; pide todo lo de la sucursal y filtra la placa en pantalla.
   */
  placa?: string | null;
  /** true = ignora la caché del backend y vuelve a entrar al portal. */
  refrescar?: boolean;
}

/** Registro tal como llega: las claves traen espacios, acentos y símbolos. */
export type RegistroScop = Record<string, string>;

export interface BloqueScop {
  ok: boolean;
  total: number;
  coincidencias: number;
  registros: RegistroScop[];
  /** Motivo cuando `ok` es false (el portal no respondió o rechazó la consulta). */
  error?: string;
  mensaje?: string;
}

export interface ScopRespuesta {
  sucursal: string;
  fecha_inicio: string;
  fecha_fin: string;
  /** Sólo viene si se pidió `para_liquido`. */
  liquido?: BloqueScop;
  /** Sólo viene si se pidió `para_glp`. */
  glp?: BloqueScop;
  /** La respuesta salió de la caché del backend (no se volvió a entrar al portal). */
  desdeCache?: boolean;
}

export type TipoScop = "liquido" | "glp";

/** Pedido ya normalizado: lo único que usa la guía. */
export interface PedidoScop {
  tipo: TipoScop;
  codigoAutorizacion: string;
  /** Vacío si el pedido no tiene factura (común en GLP). */
  factura: string;
  /** Tal cual llega: DD/MM/YYYY HH:mm:ss */
  fechaPedido: string;
  /** Marca de tiempo para ordenar. */
  fechaOrden: number;
  estado: string;
  /** Se puede usar en una guía: no está CERRADA/CERRADO ni ANULADA/ANULADO. */
  disponible: boolean;
  producto: string;
  /** Volumen ya convertido a número. */
  volumen: number;
  /** Unidad tal como la informa el SCOP ("Galones", "Kilogramos"…); "" si no la trae. */
  unidad: string;
  /** GLP: "Vendedor Razón Social" del portal. */
  vendedor: string;
  /** Líquidos: "Prov. Producto" (la refinería o planta que abastece). */
  provProducto: string;
  placa: string;
}

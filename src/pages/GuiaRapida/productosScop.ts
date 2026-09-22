/**
 * Relación entre el nombre de producto que devuelve el SCOP y el producto de
 * nuestra base de datos, más el factor para calcular el peso de la guía.
 *
 * `codigo` es el código real del producto en el backend: con él se busca en el
 * catálogo para tomar id, descripción, unidad y código SUNAT. Si no aparece, la
 * guía usa los valores de esta tabla y la pantalla lo avisa.
 */
export interface ProductoScop {
  /** Nombres tal como llegan del SCOP (se comparan sin mayúsculas ni acentos). */
  nombresScop: string[];
  /** Código del producto en el backend. */
  codigo: string;
  descripcion: string;
  /** Unidad SUNAT. */
  unidad: string;
  codProdSunat?: string;
  /**
   * Kilos por unidad. Sólo se usa cuando la unidad NO es kilogramos: si el bien
   * ya está en KGM, su cantidad se suma al peso tal cual.
   */
  factorKg: number;
}

export const PRODUCTOS_SCOP: ProductoScop[] = [
  {
    nombresScop: ["Diesel B5 S-50 UV"],
    codigo: "0003",
    descripcion: "DIESEL B5 S-50 UV",
    unidad: "GLL",
    factorKg: 3.22,
  },
  {
    nombresScop: ["GASOHOL PREMIUM"],
    codigo: "0002",
    descripcion: "GASOHOL PREMIUM",
    unidad: "GLL",
    factorKg: 2.8,
  },
  {
    nombresScop: ["GASOHOL REGULAR"],
    codigo: "0001",
    descripcion: "GASOHOL REGULAR",
    unidad: "GLL",
    factorKg: 2.8,
  },
  {
    nombresScop: ["GLP - G"],
    codigo: "0004",
    descripcion: "GLP GRANEL",
    unidad: "KGM",
    factorKg: 1,
  },
];

/** Nombre de la unidad a partir del código SUNAT, para cuando el SCOP no la informa. */
const UNIDAD_POR_CODIGO: Record<string, string> = {
  GLL: "Galones",
  KGM: "Kilogramos",
  LTR: "Litros",
};

/** Unidad del pedido: la del SCOP; si no viene, la del producto relacionado. */
export const unidadDePedido = (pedido: { unidad?: string; producto: string }): string => {
  if (pedido.unidad?.trim()) return pedido.unidad.trim();
  const codigo = productoScopDe(pedido.producto)?.unidad || "";
  return UNIDAD_POR_CODIGO[codigo] || codigo;
};

/** "Galones" -> "gal", "Kilogramos" -> "kg", "Litros" -> "L"; otra se muestra tal cual. */
export const abreviarUnidad = (unidad: string): string => {
  const texto = (unidad || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  if (!texto) return "";
  if (/^gal/.test(texto) || texto === "gll") return "gal";
  if (/^kil/.test(texto) || texto === "kg" || texto === "kgm") return "kg";
  if (/^lit/.test(texto) || texto === "ltr" || texto === "l") return "L";
  if (/^metro/.test(texto) || texto === "m3") return "m³";
  return unidad.trim();
};

/**
 * El pedido se puede usar si su unidad en el SCOP coincide con la del producto
 * de la guía. Ej.: el GLP de compras (0004) va en kilos; un pedido de GLP en
 * galones no corresponde a este código y no se ofrece. Si el SCOP no informa la
 * unidad (líquidos), se acepta.
 */
export const unidadCompatible = (pedido: { unidad?: string; producto: string }): boolean => {
  const producto = productoScopDe(pedido.producto);
  if (!producto || !pedido.unidad?.trim()) return true;
  return abreviarUnidad(pedido.unidad) === abreviarUnidad(producto.unidad);
};

const sinAcentos = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "");

const normalizarNombre = (texto: string) =>
  sinAcentos(texto || "").toUpperCase().replace(/\s+/g, " ").trim();

export const productoScopDe = (nombreScop: string): ProductoScop | undefined => {
  const buscado = normalizarNombre(nombreScop);
  return PRODUCTOS_SCOP.find((p) => p.nombresScop.some((n) => normalizarNombre(n) === buscado));
};

/* ------------------------------------------------------------------ */
/* Comparación de códigos con el backend                                */
/* ------------------------------------------------------------------ */

const normalizarCodigo = (codigo: unknown) => String(codigo ?? "").trim().toUpperCase();

/** Mismo código tal cual (sin espacios ni diferencia de mayúsculas). */
export const codigoExacto = (a: unknown, b: unknown): boolean => {
  const x = normalizarCodigo(a);
  return x !== "" && x === normalizarCodigo(b);
};

/**
 * Mismo código, o el mismo número si ambos son numéricos: "0003" = "3"
 * (por si el backend devuelve el código como número o sin ceros a la izquierda).
 */
export const mismoCodigo = (a: unknown, b: unknown): boolean => {
  if (codigoExacto(a, b)) return true;
  const x = normalizarCodigo(a);
  const y = normalizarCodigo(b);
  return /^\d+$/.test(x) && /^\d+$/.test(y) && Number(x) === Number(y);
};

/* ------------------------------------------------------------------ */
/* Peso total                                                           */
/* ------------------------------------------------------------------ */

const UNIDADES_KILOGRAMO = ["KGM", "KG", "KGS", "KILO", "KILOS", "KILOGRAMO", "KILOGRAMOS"];

/** KGM (código SUNAT) o el nombre de la unidad en kilogramos. */
export const esKilogramo = (unidad?: string | null): boolean =>
  UNIDADES_KILOGRAMO.includes(sinAcentos(unidad || "").toUpperCase().trim());

const factorKgDe = (codigo: string): number | undefined =>
  PRODUCTOS_SCOP.find((p) => mismoCodigo(p.codigo, codigo))?.factorKg;

/**
 * Peso total en kilos (entero).
 *  - Bien en kilogramos: su cantidad se suma sin convertir.
 *  - Cualquier otra unidad: cantidad × factor del producto.
 * Los bienes que no están en kilos y no tienen factor no suman y se devuelven en
 * `sinFactor` para avisar.
 */
export const calcularPesoTotal = (
  detalles: { codigo: string; cantidad: number | string; unidad?: string | null }[]
): { peso: number; sinFactor: string[] } => {
  let kilos = 0;
  const sinFactor: string[] = [];

  detalles.forEach((detalle) => {
    const cantidad = Number(detalle.cantidad) || 0;

    if (esKilogramo(detalle.unidad)) {
      kilos += cantidad;
      return;
    }

    const factor = factorKgDe(detalle.codigo);
    if (factor === undefined) {
      sinFactor.push(detalle.codigo);
      return;
    }
    kilos += cantidad * factor;
  });

  return { peso: Math.round(kilos), sinFactor };
};

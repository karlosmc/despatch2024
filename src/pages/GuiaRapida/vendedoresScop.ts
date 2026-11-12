import { PedidoScop } from "../../types/scop.interface";
import { persona } from "../../types/persona.interface";
import { masParecido } from "../../utils/similitud";

/**
 * De quién viene el pedido:
 *  - GLP: la columna "Vendedor Razón Social" del portal, que se busca por
 *    parecido en nuestros clientes ("SOLGAS S.A." = "SOLGAS SA").
 *  - Líquidos: la columna "Prov. Producto". El portal no trae la razón social
 *    del vendedor, así que se aplica la regla acordada: si abastece La Pampilla
 *    es Repsol; con cualquier otro valor (incluido "-") el proveedor lo elige
 *    el usuario.
 *
 * Los chips de vendedor NO deciden qué pedidos se pueden marcar: sólo cargan el
 * proveedor cuando se conoce, o lo dejan vacío para que se elija a mano.
 */

/** Id del cliente Repsol Comercial S.A.C. (abastecimiento de La Pampilla). */
export const CLIENTE_PAMPILLA = 17;

const PAMPILLA = /PAMPILLA/i;

/** Nombre con el que se agrupa el pedido; "" si el portal no informa nada. */
export const nombreVendedor = (pedido: PedidoScop): string =>
  (pedido.tipo === "glp" ? pedido.vendedor : pedido.provProducto).trim();

/** Etiqueta para la pantalla cuando el portal no informa el proveedor. */
export const ETIQUETA_SIN_VENDEDOR = "Sin proveedor informado";

export interface VendedorScop {
  /** Texto tal como llega del portal ("" si no vino). */
  nombre: string;
  /** Lo que se muestra. */
  etiqueta: string;
  cantidad: number;
  /** Cliente de nuestra base que le corresponde, si se encontró. */
  cliente: persona | null;
  /** 0 a 1; 1 en líquidos con regla conocida, porque no compara nombres. */
  puntaje: number;
}

/**
 * Cliente de un pedido de líquidos, por su abastecimiento: sólo se da por sabido
 * cuando abastece La Pampilla. Con cualquier otro valor (incluido "-") no se
 * adivina: el proveedor queda vacío y lo elige el usuario.
 */
const clienteDeLiquido = (provProducto: string, clientes: persona[]): persona | null =>
  PAMPILLA.test(provProducto) ? clientes.find((c) => c.id === CLIENTE_PAMPILLA) || null : null;

/**
 * Vendedores presentes en los pedidos, con su cliente y cuántos pedidos tiene
 * cada uno, del que más aporta al que menos.
 */
export const vendedoresDePedidos = (pedidos: PedidoScop[], clientes: persona[]): VendedorScop[] => {
  const porNombre = new Map<string, PedidoScop[]>();
  pedidos.forEach((p) => {
    const nombre = nombreVendedor(p);
    porNombre.set(nombre, [...(porNombre.get(nombre) || []), p]);
  });

  const vendedores: VendedorScop[] = [];
  porNombre.forEach((lista, nombre) => {
    const esGlp = lista[0].tipo === "glp";
    const coincidencia = esGlp && nombre ? masParecido(nombre, clientes, (c) => c.rznSocial || "") : null;
    const cliente = esGlp ? coincidencia?.item ?? null : clienteDeLiquido(nombre, clientes);

    vendedores.push({
      nombre,
      etiqueta: nombre || ETIQUETA_SIN_VENDEDOR,
      cantidad: lista.length,
      cliente,
      puntaje: esGlp ? coincidencia?.puntaje ?? 0 : cliente ? 1 : 0,
    });
  });

  return vendedores.sort((a, b) => b.cantidad - a.cantidad);
};

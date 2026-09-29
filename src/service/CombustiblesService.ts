import { Producto } from "../types/producto.interface";
import { ProductoService } from "./ProductoService";
import { PRODUCTOS_SCOP, codigoExacto, mismoCodigo } from "../pages/GuiaRapida/productosScop";

/**
 * Los combustibles de la tabla `PRODUCTOS_SCOP` tal como están en NUESTRO catálogo
 * (id, descripción, unidad y código SUNAT). No consulta el portal SCOP: sirve para
 * convertir el nombre de producto de un pedido en un bien de la guía.
 *
 * El catálogo casi no cambia, así que se pide una sola vez por sesión (lo guarda
 * `operacionStore`) en una sola petición; sólo si falta un código se pregunta por él.
 */
export interface CatalogoCombustibles {
  /** Código de la tabla -> producto del catálogo. */
  productos: Record<string, Producto>;
  /** Códigos que no están en el catálogo. */
  faltan: string[];
}

const buscarEn = (lista: Producto[], codigo: string) =>
  // El filtro del backend puede ser parcial: primero el código exacto, luego el mismo número.
  lista.find((x) => codigoExacto(x.codigo, codigo)) || lista.find((x) => mismoCodigo(x.codigo, codigo));

export const CombustiblesService = {
  cargar: async (): Promise<CatalogoCombustibles> => {
    const { data } = await ProductoService.get("");
    const catalogo: Producto[] = Array.isArray(data) ? data : [];

    const productos: Record<string, Producto> = {};
    PRODUCTOS_SCOP.forEach((p) => {
      const encontrado = buscarEn(catalogo, p.codigo);
      if (encontrado) productos[p.codigo] = encontrado;
    });

    for (const p of PRODUCTOS_SCOP.filter((x) => !productos[x.codigo])) {
      try {
        const respuesta = await ProductoService.get(`codigo=${encodeURIComponent(p.codigo)}`);
        const encontrado = buscarEn(Array.isArray(respuesta?.data) ? respuesta.data : [], p.codigo);
        if (encontrado) productos[p.codigo] = encontrado;
      } catch (error) {
        console.warn(`No se pudo buscar el producto ${p.codigo}:`, error);
      }
    }

    return { productos, faltan: PRODUCTOS_SCOP.filter((p) => !productos[p.codigo]).map((p) => p.codigo) };
  },
};

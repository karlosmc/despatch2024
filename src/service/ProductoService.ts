import apiLogged from "../api/axios.auth";
import { Producto } from "../types/producto.interface";


export const ProductoService = {
  
  get: async (params: string) => {
    try {
      const { data } = await apiLogged.get(`/api/productos?${params}`);
      return data;
    } catch (error: any) {
      console.error("Error al obtener los productos:", error);
      throw error?.response?.data?.message || "Error al obtener los productos";
    }
  },
  save:async (producto: Producto) => {
    try {
      const { data } = await apiLogged.post(`/api/productos`, {
        codigo:producto.codigo.toUpperCase(),
        descripcion: producto.descripcion.toUpperCase(),
        unidad: producto.unidad,
        codProdSunat: producto.codProdSunat || '',
        nombreCorto: producto.nombreCorto.toUpperCase() || '',
      });
      return data.producto;
    }
    catch (error: any) {
      console.error("Error al guardar el producto:", error);
      throw error?.response?.data?.message || "Error al guardar el producto";
    }
  },
  update:async (producto: Producto) =>{
    try {

      const {data} = await apiLogged.put(`/api/productos/${producto.id}`,{
        codigo:producto.codigo.toUpperCase(),
        descripcion: producto.descripcion.toUpperCase(),
        unidad: producto.unidad,
        codProdSunat: producto.codProdSunat || '',
        nombreCorto: producto.nombreCorto.toUpperCase() || '',
      });
      return data.producto;
      
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      throw error?.response?.data?.message || "Error al actualizar el producto";
    }
  }
  


};
import apiLogged from "../api/axios.auth";
import { apiInitCi } from "../api/axios.ci";





export const GuiaServices = {
  
  get:async(id:number)=>{
    try {
      const {data} = await apiLogged(`/api/despatches/${id}`)
      return data;
      
    } catch (error:any) {
      console.error("Error al obtener la guia:", error);
      throw error?.response?.data?.error || "Error al obtener la guia";
    }

  },
  getPdfById:async(id:number)=>{
    try {
      const {data} = await apiLogged(`/api/despatches/pdf/${id}`)
      return data;
    } catch (error:any) {
      console.error("Error al obtener el PDF por ID:", error);
      throw error?.response?.data?.message || "Error al obtener el PDF por ID";
    }
  },
  guias: async (params: string) => {
    try {
      const { data } = await apiLogged.get(`/api/estadoelectronico/${params}`);
      return data;
    } catch (error: any) {
      console.error("Error al obtener las guias:", error);
      throw error?.response?.data?.message || "Error al obtener las guias";
    }
  },
    guiasmigracion: async (params: string) => {
    try {
      const { data } = await apiLogged.get(`/api/migracion/${params}`);
      return data;
    } catch (error: any) {
      console.error("Error al obtener las guias:", error);
      throw error?.response?.data?.message || "Error al obtener las guias";
    }
  },
  series: async () => {
    try {
      const { data } = await apiLogged.get(`/api/numeracion/userid`);
      return data;
    } catch (error: any) {
      console.error("Error al obtener las series:", error);
      throw error?.response?.data?.message || "Error al obtener las series";
    }
  },

  getPdf: async(doc:any)=>{

    try {
      const { data } = await apiInitCi.post(`/GeneraPdfDespatch`, {doc});
      return data;
    } catch (error: any) {
      console.error("Error al obtener el PDF:", error);
      throw error?.response?.data?.message || "Error al obtener el PDF";
    }

  },
  // getGuia: async(id:number)=>{
  //   try {
  //     const { data } = await apiLogged.get(`/api/despatches/${id}`);
  //     return data;
  //   } catch (error: any) {
  //     console.error("Error al obtener la guia:", error);
  //     throw error?.response?.data?.message || "Error al obtener la guia";
  //   }
  // },
  consultarNotas: async(serie:string,numero:string) =>{

    try {

      const {data} = await apiInitCi(`/ConsultaGuia/notas/${serie}-${numero}`)
      return data;
      
    } catch (error) {
      
    }

  },

  save:async(guia:any) => {
    try {
      const { data } = await apiLogged.post(`/api/despatches`, {...guia});
      
      return data;
    } catch (error: any) {
      console.error("Error al guardar la guia:", error);
      // `error` trae el detalle en los 409 (serie + correlativo duplicados)
      throw error?.response?.data?.message || error?.response?.data?.error || "Error al guardar la guia";
    }
  },
  update:async(guia:any,id:number) => {
    try {
      const { data } = await apiLogged.put(`/api/despatches/${id}`, {...guia});
      return data;
    } catch (error: any) {
      console.error("Error al actualizar la guia:", error);
      throw error?.response?.data?.message || error?.response?.data?.error || "Error al actualizar la guia";
    }
  },
  report:async(params:string)=>{
    try {

      const {data} = await apiLogged(`/api/despatches/buscar?${params}`,{
        responseType: 'blob'  // Importante para recibir el archivo como blob
      })
      return data;
      
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      throw error?.response?.data?.message || "Error al generar el reporte";
    }

  },

  
  descargar:async(params:string)=>{
    try {
       const {data} = await apiLogged(`/api/estadoelectronico/descargar?${params}`,{
        responseType: 'blob'  // Importante para recibir el archivo como blob
      })
      return data;
      
    } catch (error) {
      
      console.error("Error al descargar las guias:", error);
      throw error?.response?.data?.message || "Error al descargar las guias";
    }
  },

  baja:async(id:number)=>{
    try {
      const {data} = await apiLogged.put(`/api/despatches/baja/${id}`);
      return data;
    } catch (error) {
      console.error("Error al anular la guia:", error);
      throw error?.response?.data?.message || "Error al anular la guia";
      
    }

  },

  almacenesBaseFafio: async (opcion: string = "0") => {
    try {
      const { data } = await apiLogged.get(`/api/migracion/almacenes?opcion=${opcion}`);
      return data;
    } catch (error: any) {
      console.error("Error al obtener los almacenes base:", error);
      throw error?.response?.data?.message || "Error al obtener los almacenes base";
    }
  },

  migrar: async (payload: { id_despatch: number; almacen_origen: string; almacen_destino: string }[]) => {
    try {
      const { data } = await apiLogged.post('/api/migracion/migrar', payload);
      return data;
    } catch (error: any) {
      console.error("Error al migrar:", error);
      throw error?.response?.data?.message || "Error al migrar las guías";
    }
  },

};
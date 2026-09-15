import apiLogged from "../api/axios.auth"
import { apiInit } from "../api/axios.ini";
import { persona } from "../types/persona.interface";



export const PersonaService = {

  get: async (params: string) => {
    try {
      const { data } = await apiLogged(`/api/clientes?${params}`)
      return data;
    } catch (error: any) {
      console.error("Error al obtener a las personas:", error);
      throw error?.response?.data?.message || "Error al obtener a las personas";
    }
  },
  save: async (persona: persona) => {
    try {

      const { data } = await apiLogged.post('/api/clientes', {

        numDoc: persona.numDoc,
        rznSocial: persona.rznSocial.toUpperCase() || '',
        isCompany: persona.isCompany,
        email: persona.email.toUpperCase() || '',
        nombreCorto: persona.nombreCorto.toUpperCase() || '',
        telephone: persona.telephone,
        tipoDoc: persona.tipoDoc,
      });

      return data.persona;

    } catch (error: any) {
      console.error("Error al guadar a la personas:", error);
      throw error?.response?.data?.message || "Error al guadar a la personas";
    }
  },
  update: async (persona: persona) => {
    try {

      const { data } = await apiLogged.put(`/api/clientes/${persona.id}`, {
        numDoc: persona.numDoc,
        rznSocial: persona.rznSocial.toUpperCase() || '',
        isCompany: persona.isCompany,
        email: persona.email.toUpperCase() || '',
        nombreCorto: persona.nombreCorto.toUpperCase() || '',
        telephone: persona.telephone,
        tipoDoc: persona.tipoDoc,
      });

      return data.cliente ?? data.persona;

    } catch (error: any) {
      console.error("Error al guadar a la personas:", error);
      throw error?.response?.data?.message || "Error al guadar a la personas";
    }
  },
  consulta: async (valor:string,tipo:string)=>{
    try {
      
      const {data} = await apiInit(`/api/factiliza/consulta?nro=${valor}&type=${tipo}`,{timeout:20000})
      return data
    } catch (error:any) {
      console.error("Error al consultar:", error);
      throw error?.response?.data?.message || "Error al consultar";
      
    }

  }
}
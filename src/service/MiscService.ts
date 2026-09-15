import apiLogged from "../api/axios.auth"


export const MiscService = {

  ubigeos: async() =>{
    try {
      const {data} = await apiLogged('/api/ubigeos');
      
      return data;

    } catch (error:any) {
      console.log(error);
      throw error?.response?.data?.message || "Error al obtener los ubigeos";
      
    }
  }
}
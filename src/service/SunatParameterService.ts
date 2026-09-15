import apiLogged from "../api/axios.auth"

export const SunatParameterService = {
  get:async()=>{
    try {
      const {data} = await apiLogged('/api/sunat');
      return data;
    } catch (error:any) {
      console.log('Hubo un error al obtener los parámetros de SUNAT',error);
      throw error?.response?.data?.message || 'Hubo un error al obtener los parámetros de SUNAT';
    }
  },
  save:async(sunatParameter: FormData)=>{
    try {
      const { data } = await apiLogged.post('/api/sunat',sunatParameter,{
        headers:{
          'Content-Type':'multipart/form-data'
        }
      })
      return data.sunat;
    } catch (error:any) {
      console.log('Hubo un error al guardar los parametros',error);
      throw error?.response?.data?.message || 'Hubo un error al guardar los parametros';
      
    }
  },
  update:async(sunatParameter: FormData,id:number)=>{
    try {
      const { data } = await apiLogged.post(`/api/sunat/${id}?_method=PUT`,sunatParameter,{
        headers:{
          'Content-Type':'multipart/form-data'
        }
      })
      return data.sunat;
    } catch (error:any) {
      console.log('Hubo un error al actualizar los parametros',error);
      throw error?.response?.data?.message || 'Hubo un error al actualizar los parametros';
      
    }
  }

}
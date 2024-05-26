import React, { useEffect } from "react";
import clienteAxios from "../config/axios";
import useSWR from 'swr'

import {useNavigate} from 'react-router-dom'
import Inicio from "../views/Inicio";


interface authInterface {
  middleware:string;
  url:string;
}

interface request {
  datos:{},
  setErrores:React.Dispatch<React.SetStateAction<string[]>>;
}

export const useAuth = ({middleware , url}:authInterface) =>{
  middleware=middleware
  url=url

  const token  = localStorage.getItem('AUTH_TOKEN');

  const navigate = useNavigate();

  const { data:user , error , mutate,isLoading} = useSWR('/api/user',()=>
    clienteAxios('/api/user',{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res => res.data)
    .catch(error => {
      throw Error(error?.response?.data?.errors)
    })
  )

  const registro = async({datos, setErrores}:request) =>{
    
    try {
      const {data} = await clienteAxios.post('/api/registro',datos);
      localStorage.setItem('AUTH_TOKEN',data.token)
      setErrores([])
      await mutate();
    } catch (error) {
        setErrores(Object.values(error.response.data.errors))
    }
  }

  const login = async ({datos, setErrores}:request) =>{

    try {
      const {data} = await clienteAxios.post('/api/login',datos);
      
      localStorage.setItem('AUTH_TOKEN',data.token)
      setErrores([]);
      await mutate()
    } catch (error) {
      
      setErrores(Object.values(error.response.data.errors))
    }

  }

  // useEffect(() => {


  //   if(middleware === 'guest' && url && user){
  //     navigate(url);
  //   }
  //   if(middleware === 'auth' && user) navigate('/admin');
  //   // if(middleware === 'auth' && user && !user.admin){
  //   //   navigate('/');
  //   // }else{
  //   //   console.log('no entro')
  //   // }

  //   if(middleware === 'auth' && error){
  //     navigate('/auth/login');
  //   }
    
  // }, [user,error])



  return {
    registro,
    user,
    error,
    login,
    isLoading
  }
  
}
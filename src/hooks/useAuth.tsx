import React, { useEffect } from "react";
import clienteAxios from "../config/axios";
import useSWR from 'swr'

import {useNavigate} from 'react-router-dom'
import { useNotification } from "../context/notification.context";
// import Inicio from "../views/Inicio";


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

  const { getSuccess }= useNotification()
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
      await clienteAxios.post('/api/registro',datos);
      
      getSuccess('Usuario Creado satisfactoriamente');
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
      // localStorage.setItem('AUTH_TOKEN',data.token)
      // setErrores([])
      await mutate();
    } catch (error) {
        setErrores(Object.values(error.response.data.errors))
    }
  }

  const login = async ({datos, setErrores}:request) =>{

    try {
      const {data} = await clienteAxios.post('/api/login',datos);
      console.log(data)
      if(data.token===''){
        setErrores([data.error])
        return;
      }
      localStorage.setItem('AUTH_TOKEN',data.token)
      setErrores([]);
      await mutate()
    } catch (error) {
      
      setErrores(Object.values(error.response.data.errors))
    }

  }

  const logout = async() =>{
    try {
      
      await clienteAxios.post('/api/logout',null,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      localStorage.removeItem('AUTH_TOKEN');
      await mutate(undefined)
    } catch (error) {

      console.log(error)
      throw Error(error?.response?.data?.errors)
    }
  }

  useEffect(() => {


    if(middleware === 'guest' && url && user){
      navigate(url);
    }
    if(middleware === 'auth' && user) navigate('/admin');
    // if(middleware === 'auth' && user && !user.admin){
    //   navigate('/');
    // }else{
    //   console.log('no entro')
    // }

    if(middleware === 'auth' && url==='/guiaremision' && user){
      navigate(url);
    }

    if(middleware === 'auth' && error){
      navigate('/auth/login');
    }
    
  }, [user,error])



  return {
    registro,
    user,
    error,
    login,
    isLoading,
    logout
  }
  
}
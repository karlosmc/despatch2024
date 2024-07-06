import { useEffect, useState } from 'react';

import { ParamsInterface } from '../types/params.interface';
import clienteAxios from '../config/axios';
import { IToken } from '../types/token.interface';


const TOKEN_KEY = 'token_sunat';
const TOKEN_EXPIRY_KEY = 'token_sunat_expiry';


const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  // const [entorno, setEntorno] = useState<string>('')
  

  const saveToken = (newToken: string, expiryTime: number) => {

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    setToken(newToken);
  };

  const getToken = async (): Promise<string | null> => {

    
    const expiryTimeGet = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const UnixExpiryTimeGet=new Date(parseInt(expiryTimeGet)*1000)
    const UnixCurDateGet = new Date(Date.now())
    if (expiryTimeGet && UnixCurDateGet < UnixExpiryTimeGet) {
      return token;
    } else {
      const data = await checkToken();
      if (data) {
        const expiryTime = data?.expiryTime;
        const UnixExpiryTime=new Date(expiryTime*1000)
        const UnixCurDate = new Date(Date.now())
        
        if (expiryTime && UnixCurDate < UnixExpiryTime) {
          localStorage.setItem(TOKEN_KEY, data.access_token);
          localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
          setToken(data.access_token);
          return data.access_token;
        }
      }
      const newToken = await fetchNewToken();

      if (newToken) {
        saveToken(newToken.access_token, newToken.expiryTime);
        return newToken.access_token;
      }
    }
    return null;
  };

  // const getFecha = (date: Date) => {

    

  //   // Obtener componentes de la fecha
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11, por lo que sumamos 1
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const hours = String(date.getHours()).padStart(2, '0');
  //   const minutes = String(date.getMinutes()).padStart(2, '0');

  //   // Formatear en yyyy-mm-dd hh:mm
  //   return  `${year}-${month}-${day} ${hours}:${minutes}`;
  // }

  const getSunatParams = async (): Promise<ParamsInterface | null> => {

    const params = await fetchSunatParameters();

    // setEntorno(params.tipo)


    return params
  }


  useEffect(()=>{
    
  })

  return { token, getToken, saveToken, getSunatParams };
};



const fetchSunatParameters = async (): Promise<ParamsInterface | null> => {
  // Implement your API call to fetch a new token

  const token = localStorage.getItem('AUTH_TOKEN');
  const { data, statusText, } = await clienteAxios('/api/sunat/parametros',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  // console.log(data)
  if (statusText === "OK") {
    // console.log(data)
    return data.data;
  }
  return null;
};

const fetchNewToken = async (): Promise<IToken | null> => {
  // Implement your API call to fetch a new token
  const token = localStorage.getItem('AUTH_TOKEN');
  const { data, statusText } = await clienteAxios.post('/api/tokensunat', null,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  if (statusText === "Created") {
    return data;
  }
  return null;
};

const checkToken = async (): Promise<IToken | null> => {
  const token = localStorage.getItem('AUTH_TOKEN');
  const { data, statusText, } = await clienteAxios('/api/tokensunat/',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  if (statusText === "OK") {
    // console.log(data)
    return data;
  }
  return null;
}
export default useAuthToken;


import { useState } from 'react';
import clienteAxiosElectronico from '../config/axiose';

import { ParamsInterface } from '../types/params.interface';
import clienteAxios from '../config/axios';
import { IToken } from '../types/token.interface';

const TOKEN_KEY = 'token_sunat';
const TOKEN_EXPIRY_KEY = 'token_sunat_expiry';
const TOKEN_LIFETIME = 3600 * 1000; // 3600ms = 1 hora

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));

  const saveToken = (newToken: string) => {
    const expiryTime = Date.now() + TOKEN_LIFETIME;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    setToken(newToken);
  };

  const getToken = async (): Promise<string | null> => {

    
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiryTime && Date.now() < parseInt(expiryTime)) {
      return token;
    } else {
      // Implement your logic to fetch a new token
      const newToken = await fetchNewToken();
      if (newToken) {
        saveToken(newToken);
        return newToken;
      }
    }
    return null;
  };
  const getSunatParams = async() : Promise<ParamsInterface | null> =>{
    
    return await fetchSunatParameters()
  }

  return { token, getToken, saveToken , getSunatParams };
};

const fetchSunatParameters = async (): Promise<ParamsInterface | null> => {
  // Implement your API call to fetch a new token

  const token = localStorage.getItem('AUTH_TOKEN');
  const {data,statusText,} = await clienteAxios('/api/sunat/parametros',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  if (statusText==="OK") {
    // console.log(data)
    return data.data;
  }
  return null;
};

const fetchNewToken = async (): Promise<string | null> => {
  // Implement your API call to fetch a new token
  const {data,statusText,} = await clienteAxiosElectronico('/GetToken/Token/1', null )
  if (statusText==="OK") {
    return data.access_token;
  }
  return null;
};

const checkToken = async ():Promise<IToken | null >=>{
  const token = localStorage.getItem('AUTH_TOKEN');
  const {data,statusText,} = await clienteAxios('/api/tokensunat/',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  if (statusText==="OK") {
    // console.log(data)
    return data;
  }
  return null;
}
export default useAuthToken;
  

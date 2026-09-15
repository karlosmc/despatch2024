
import { create } from 'zustand';
import { ParamsInterface } from '../types/params.interface';
import { IToken } from '../types/token.interface';
import apiLogged from '../api/axios.auth';

const TOKEN_KEY = 'token_sunat';
const TOKEN_EXPIRY_KEY = 'token_sunat_expiry';
const PARAMS_KEY = 'sunat_params';

interface AuthTokenState {
  token: string | null;
  saveToken: (newToken: string, expiryTime: number) => void;
  getToken: () => Promise<string | null>;
  getSunatParams: () => Promise<void>;
  params: ParamsInterface | null;
  clearAll: () => void; // Nuevo método para limpiar todo
}

export const useTokenParamsStore = create<AuthTokenState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  
  // Inicializar params desde localStorage
  params: (() => {
    try {
      const storedParams = localStorage.getItem(PARAMS_KEY);
      return storedParams ? JSON.parse(storedParams) : null;
    } catch (error) {
      console.error('Error parsing stored params:', error);
      return null;
    }
  })(),

  saveToken: (newToken: string, expiryTime: number) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    set({ token: newToken });
  },

  getToken: async () => {
    const { token, saveToken } = get();
    const expiryTimeGet = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (expiryTimeGet) {
      const UnixExpiryTimeGet = new Date(parseInt(expiryTimeGet) * 1000);
      const UnixCurDateGet = new Date(Date.now());
      if (UnixCurDateGet < UnixExpiryTimeGet) {
        return token;
      }
    }

    const data = await checkToken();
    if (data) {
      const expiryTime = data?.expiryTime;
      const UnixExpiryTime = new Date(expiryTime * 1000);
      const UnixCurDate = new Date(Date.now());

      if (expiryTime && UnixCurDate < UnixExpiryTime) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        set({ token: data.access_token });
        return data.access_token;
      }
    }

    const newToken = await fetchNewToken();
    if (newToken) {
      saveToken(newToken.access_token, newToken.expiryTime);
      return newToken.access_token;
    }

    return null;
  },
  
  getSunatParams: async () => {
    const data = await fetchSunatParameters();
    
    // Guardar en localStorage para persistencia
    if (data) {
      localStorage.setItem(PARAMS_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(PARAMS_KEY);
    }
    
    set({ params: data });
  },

  clearAll: () => {
    // Limpiar el estado en memoria
    set({ 
      token: null, 
      params: null 
    });
    
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(PARAMS_KEY);
    
    console.log("TokenParamsStore limpiado completamente");
  }
}));

// Funciones auxiliares (fuera del store)
const fetchSunatParameters = async (): Promise<ParamsInterface | null> => {
  
  try {
    const { data, statusText } = await apiLogged('/api/sunat/parametros')
    return statusText === 'OK' ? data.data : null;
  } catch (error:any) {
    console.log('Hubo un error al consultar los parametros');
    throw error?.response?.data?.message || 'Hubo un error al consultar los parametros';
  }
};

const fetchNewToken = async (): Promise<IToken | null> => {
  try {
    const { data, statusText } = await apiLogged.post('/api/tokensunat')
    return statusText === 'Created' ? data : null;
  } catch (error:any) {
    console.log('Hubo un error al crear el token');
    throw error?.response?.data?.message || 'Hubo un error al crear el token';
  }
};

const checkToken = async (): Promise<IToken | null> => {
  try {
    const { data, statusText } = await apiLogged('/api/tokensunat');
    return statusText === 'OK' ? data : null;
  } catch (error:any) {
    console.log('Hubo un error al obtener el token');
    throw error?.response?.data?.message || 'Hubo un error al obtener el token';
  }
};

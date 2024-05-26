import { createContext, useContext, useEffect, useState } from "react";
import { TokenInterface } from "../types/token.interface";
// import { useParamsSunat } from "./params.context";

import dayjs from "dayjs";


const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS

const INITIAL_STATE: TokenInterface = {
  company: 1,
  access_token: "",
  token_type: "",
  expires_in: 3600,
  created_at: "",
  expires_at: "",
  user:1,
  sunatParams:{
    id: 1,
    company: "",
    client_id: "",
    client_secret: "",
    username: "",
    password: "",
    grant_type: "",
    scope: "",
    endpointurl: "",
    certificado: "",
    clavecertificado: "",
    tipo: "",
    urlsend:'',
    urlconsult:''
  }
};

interface TokenContextProps {
  token: TokenInterface | null;
  isLoading: boolean;
  fetchGetToken:(empresaId:number)=> Promise<void>;
}

interface TokenProviderProps {
  children: JSX.Element | JSX.Element[];
}

const Context = createContext<TokenContextProps | undefined>(undefined);

export const useTokenSunat = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useDataLoading must be used within a DataLoadingProvider");
  } else {
    return context;
  }
};

export const TokenProvider = ({ children }: TokenProviderProps) => {
  // const { data } = useParamsSunat();
  
  const [isLoading, setIsLoading] = useState(true)
  // const [token, setToken] = useState<TokenInterface | null>(
  //   JSON.parse(localStorage.getItem("token")) || INITIAL_STATE
  // );

  const [token, setToken] = useState<TokenInterface | null>(INITIAL_STATE);

  const fetchGetToken = async (empresaId:number)=>{
    // setIsLoading(true);
    // console.log('entro');
    const response = await fetch(`${API_GUIAS}gettoken/newtoken/${empresaId}`);
    const dataJson = await response.json();
    // console.log(dataJson);
    setToken(dataJson);
    // localStorage.setItem("token",JSON.stringify(dataJson));
    setIsLoading(false)
    // return dataJson;
  }

  useEffect(() => {
    if(token.access_token!==""){
      const interval = setInterval(() => {
        // console.log(token);
        if (token.sunatParams.company !== "") {
          const expires_date =
            token.expires_at !== "" ? dayjs(token.expires_at) : dayjs();
          const local_date = dayjs();
          if (
            token.access_token === "" ||
            local_date.diff(expires_date, "second") >= 0
          ) {
            fetchGetToken(token.company)
          }
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // const refreshToken = async (empresaId:number) => {
  //   const url = `http://localhost:8080/apiguias/gettoken/newtoken/${empresaId}`;
  //   // const RequestToken = {
  //   //   client_id: data.client_id,
  //   //   username: data.username,
  //   //   password: data.password,
  //   //   endPointUrl: data.endpointurl,
  //   //   grant_type: data.grant_type,
  //   //   client_secret: data.client_secret,
  //   //   scope: data.scope,
  //   // };

  //   // const options = {
  //   //   method: "post",
  //   //   headers: {
  //   //     "Content-type": "application/json",
  //   //   },
  //   //   body: JSON.stringify(RequestToken),
  //   // };

  //   const getTokenApi = async (url) => {
  //     const consult = await fetch(url);
  //     return consult.json();
  //   };

  //   getTokenApi(url, options).then((response) => {
  //     setToken(response);
  //     localStorage.setItem("token", JSON.stringify(response));
  //   });
  // };

  return <Context.Provider value={{ token, isLoading,fetchGetToken }}>{children}</Context.Provider>;
};


// import { createContext, useContext, useEffect, useState } from "react";
// import { TokenInterface } from "../types/token.interface";
// import { useParamsSunat } from "./params.context";

// import dayjs from "dayjs";

// const INITIAL_STATE: TokenInterface = {
//   company: 1,
//   access_token: "",
//   token_type: "",
//   expires_in: 3600,
//   created_at: "",
//   expires_at: "",
//   user:1,
//   sunatParams:{
//     id: 1,
//     company: "1",
//     client_id: "",
//     client_secret: "",
//     username: "",
//     password: "",
//     grant_type: "",
//     scope: "",
//     endpointurl: "",
//     certificado: "",
//     clavecertificado: "",
//     tipo: "",
//     urlsend:'',
//     urlconsult:''
//   }
// };

// interface TokenContextProps {
//   token: TokenInterface | null;
//   isLoading: boolean;
//   fetchGetToken:(empresaId:number)=> Promise<void>;
// }

// interface TokenProviderProps {
//   children: JSX.Element | JSX.Element[];
// }

// const Context = createContext<TokenContextProps | undefined>(undefined);

// export const useTokenSunat = () => {
//   const context = useContext(Context);
//   if (!context) {
//     throw new Error("useDataLoading must be used within a DataLoadingProvider");
//   } else {
//     return context;
//   }
// };

// export const TokenProvider = ({ children }: TokenProviderProps) => {
//   const { data } = useParamsSunat();

//   const [token, setToken] = useState<TokenInterface | null>(
//     JSON.parse(localStorage.getItem("token")) || INITIAL_STATE
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (data.company !== "") {
//         const expires_date =
//           token.expires_at !== "" ? dayjs(token.expires_at) : dayjs();
//         const local_date = dayjs();
//         if (
//           token.access_token === "" ||
//           local_date.diff(expires_date, "second") >= 0
//         ) {
//           refreshToken();
//         }
//       }
//     }, 10000);
//     return () => clearInterval(interval);
//   }, [data, token]);

//   const refreshToken = async () => {
//     const url = `http://localhost:8080/apiguias/gettoken`;
//     const RequestToken = {
//       client_id: data.client_id,
//       username: data.username,
//       password: data.password,
//       endPointUrl: data.endpointurl,
//       grant_type: data.grant_type,
//       client_secret: data.client_secret,
//       scope: data.scope,
//     };

//     const options = {
//       method: "post",
//       headers: {
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(RequestToken),
//     };

//     const getTokenApi = async (url, options) => {
//       const consult = await fetch(url, options);
//       return consult.json();
//     };

//     getTokenApi(url, options).then((response) => {
//       setToken(response);
//       localStorage.setItem("token", JSON.stringify(response));
//     });
//   };

//   return <Context.Provider value={{ token, isLoading,fetchGetToken }}>{children}</Context.Provider>;
// };

import { createContext,useContext,useState } from "react";
import { ParamsInterface } from "../types/params.interface";

const INITIAL_STATE:ParamsInterface = {
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


interface ParamsContextProps {
  isLoading: boolean;
  data:ParamsInterface;
  fetchCompany:(empresaId:number)=> Promise<void>;
}



interface ParamsProviderProps {
  children :JSX.Element | JSX.Element[]
}

const Context = createContext<ParamsContextProps>(undefined);


export const useParamsSunat= ()=>{
  const context = useContext(Context);
  if( !context){
    throw new Error('useDataLoading must be used within a DataLoadingProvider');

  }else{
    return context;
  }
}



export const ParamsProvider= ({children}:ParamsProviderProps)=>{

  const [isLoading, setIsLoading] = useState(true)

  const [data, setData] = useState<ParamsInterface>(INITIAL_STATE);



  const fetchCompany = async (empresaId:number)=>{

    // setIsLoading(true);
    const response = await fetch(`http://192.168.30.199:8080/apiguias/GetParamsCompany/${empresaId}`);
    const dataJson = await response.json();
    setData(dataJson.response);
    setIsLoading(false)
  }


  // useEffect(() => {
  //   // Realiza el fetch para cargar los datos iniciales
  //   fetch(`http://localhost:8080/apiguias/GetParamsCompany/${empresaId}`)
  //     .then(response => response.json())
  //     .then(data => {
  //       // console.log(data);
  //       setData(data.response)

  //       setTimeout(() => {
  //         setIsLoading(false)  
  //       }, 2000);
        
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       setIsLoading(false)
  //     });
  // }, []);

  return (
    <Context.Provider value={{isLoading,data,fetchCompany}}>
      {children}
    </Context.Provider>
  )

  
}


// import { createContext,useContext,useEffect,useState } from "react";
// import { ParamsInterface } from "../types/params.interface";

// const INITIAL_STATE:ParamsInterface = {
//   id: 1,
//   company: "",
//   client_id: "",
//   client_secret: "",
//   username: "",
//   password: "",
//   grant_type: "",
//   scope: "",
//   endpointurl: "",
//   certificado: "",
//   clavecertificado: "",
//   tipo: "",
//   urlsend:'',
//   urlconsult:''
// }


// interface ParamsContextProps {
//   isLoading: boolean;
//   data:ParamsInterface;
// }



// interface ParamsProviderProps {
//   children :JSX.Element | JSX.Element[]
// }

// const Context = createContext<ParamsContextProps>(undefined);


// export const useParamsSunat= ()=>{
//   const context = useContext(Context);
//   if( !context){
//     throw new Error('useDataLoading must be used within a DataLoadingProvider');

//   }else{
//     return context;
//   }
// }



// export const ParamsProvider= ({children}:ParamsProviderProps)=>{

//   const [isLoading, setIsLoading] = useState(true)

//   const [data, setData] = useState<ParamsInterface>(INITIAL_STATE);

//   useEffect(() => {
//     // Realiza el fetch para cargar los datos iniciales
//     fetch('http://localhost:8080/apiguias/GetParamsCompany')
//       .then(response => response.json())
//       .then(data => {
//         // console.log(data);
//         setData(data.response)

//         setTimeout(() => {
//           setIsLoading(false)  
//         }, 2000);
        
//       })
//       .catch(error => {
//         console.log(error);
//         setIsLoading(false)
//       });
//   }, []);

//   return (
//     <Context.Provider value={{isLoading,data}}>
//       {children}
//     </Context.Provider>
//   )

  
// }



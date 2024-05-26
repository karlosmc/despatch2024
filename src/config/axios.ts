import axios, { AxiosInstance } from 'axios'

const clienteAxios:AxiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        'Accept':'application/json',
        'X-Requested-With':'XMLHttpRequest'
    },
    withCredentials:true
});

export default clienteAxios
import axios, { AxiosInstance } from 'axios'

const clienteAxiosElectronico:AxiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL_GUIAS,   
});

export default clienteAxiosElectronico
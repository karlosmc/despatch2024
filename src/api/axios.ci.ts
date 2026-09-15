import axios, { AxiosInstance } from 'axios';
export const apiInitCi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL_GUIAS,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false
  //  withCredentials: true
});
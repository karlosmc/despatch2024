import axios from 'axios';
export const BASE_URL = "http://192.168.30.199:8080/apiguias/"

export const instance = axios.create({
    baseURL: BASE_URL,

})


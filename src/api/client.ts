import { ClientInterface } from "../types/client.interface"
import { instance } from "./base.api"

const endpoint  = "client"

export const client = {
    getAll: function(){
        return instance.get(`${endpoint}/getAll`)
    },
    getById: function({id}:{id: string | undefined}){
        return instance.get(`${endpoint}/${id}`)
    },
    save : function(data:ClientInterface){
        return instance.post(`${endpoint}/save`,data)
    }
}
import { create } from "zustand";
import { GuiaServices } from "../service/GuiaServices";
import { Ubigeos } from "../types/ubigeos.interface";
import { MiscService } from "../service/MiscService";


interface MiscState {
  series: any[];
  getSeries: () => Promise<void>;
  ubigeos: Ubigeos[];
  getUbigeos: () => Promise<void>;
  clearAll: () => void; // Nuevo método para limpiar todo
}


export const useMiscStore = create<MiscState>((set, _) => ({
  series: [],
  ubigeos: [],
  getSeries: async () => {
    try {
      const response = await GuiaServices.series();

      set({ series: response });
    } catch (error) {
      console.error('Failed to fetch series:', error);
    }
  },

  getUbigeos: async () => {
    try {
      const { data }  = await MiscService.ubigeos();
      
      set({ ubigeos: data });
    } catch (error: any) {
      console.log(error);
      throw error?.response?.data?.message || "Error al obtener los ubigeos";
    }

  },

  clearAll: () => {
    // Limpiar el estado en memoria
    set({ 
      series: [], 
      ubigeos: [] 
    });
    
    console.log("MiscStore limpiado completamente");
  }



}))
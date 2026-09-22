import { create } from "zustand";

import { PuntoEmisionService } from "../service/PuntoEmisionService";
import { NumeracionService } from "../service/NumeracionService";
import { ConductoresService } from "../service/ConductoresServices";
import { puntoEmision } from "../types/puntoemision.interface";
import { numeracion } from "../types/numeracion.interface";
import { conductor } from "../types/conductor.interface";

/**
 * Datos de trabajo del usuario: su punto de emisión, la serie con su correlativo
 * y sus vehículos, y el conductor ligado a su DNI.
 *
 * Se cargan una vez al entrar al sistema, no al abrir la guía rápida, así esa
 * pantalla ya los tiene listos. Se pueden cambiar desde la guía rápida.
 */
export type EstadoOperacion = "vacio" | "cargando" | "listo" | "error";

interface OperacionState {
  estado: EstadoOperacion;
  /** Motivo por el que no se pudo cargar. */
  error: string | null;
  /** Datos que faltan, para mostrarlos sin tratarlos como error. */
  avisos: string[];
  puntos: puntoEmision[];
  puntoId: number | null;
  series: numeracion[];
  serie: numeracion | null;
  conductor: conductor | null;
  cargar: (usuario: { id?: number; documento?: string } | null) => Promise<void>;
  /** Cambia de punto y trae sus series (la guía rápida lo usa al cambiarlo). */
  elegirPunto: (id: number) => Promise<void>;
  elegirSerie: (serie: numeracion | null) => void;
  /** Vuelve a leer las series del punto: tras guardar, el correlativo ya avanzó. */
  refrescarSerie: () => Promise<void>;
  clearAll: () => void;
}

const VACIO = {
  estado: "vacio" as EstadoOperacion,
  error: null,
  avisos: [],
  puntos: [],
  puntoId: null,
  series: [],
  serie: null,
  conductor: null,
};

const comoTexto = (error: unknown, porDefecto: string) =>
  typeof error === "string" ? error : error instanceof Error ? error.message : porDefecto;

const seriesDePunto = async (idPunto: number): Promise<numeracion[]> => {
  const { data } = await NumeracionService.getNumeracionByIdPuntoEmision(idPunto);
  return Array.isArray(data) ? data : [];
};

export const useOperacionStore = create<OperacionState>((set, get) => ({
  ...VACIO,

  cargar: async (usuario) => {
    if (!usuario?.id || get().estado === "cargando") return;
    set({ estado: "cargando", error: null, avisos: [] });

    const avisos: string[] = [];
    try {
      // Una petición tras otra: el backend atiende de a una.
      const respuesta = await PuntoEmisionService.getPuntosByUserId(usuario.id);
      const puntos: puntoEmision[] = Array.isArray(respuesta) ? respuesta : respuesta?.data || [];

      let series: numeracion[] = [];
      let serie: numeracion | null = null;
      const puntoId = puntos[0]?.id ?? null;

      if (!puntoId) {
        avisos.push("Tu usuario no tiene puntos de emisión asignados.");
      } else {
        series = await seriesDePunto(puntoId);
        serie = series[0] || null;
        if (!serie) avisos.push("El punto de emisión no tiene series asignadas.");
        else if (!serie.primario?.placa) avisos.push(`La serie ${serie.serie} no tiene vehículo asignado.`);
      }

      let chofer: conductor | null = null;
      const documento = (usuario.documento || "").trim();
      if (!documento) {
        avisos.push("Tu usuario no tiene DNI registrado.");
      } else {
        const { data } = await ConductoresService.getConductorByNroDoc(documento);
        chofer = (data || [])[0] || null;
        if (!chofer) avisos.push(`Tu DNI ${documento} no está registrado como conductor.`);
      }

      set({ estado: "listo", error: null, avisos, puntos, puntoId, series, serie, conductor: chofer });
    } catch (error) {
      set({ estado: "error", error: comoTexto(error, "No se pudieron cargar tus datos de trabajo") });
    }
  },

  elegirPunto: async (id) => {
    if (id === get().puntoId) return;
    set({ puntoId: id, series: [], serie: null });
    try {
      const series = await seriesDePunto(id);
      set({ series, serie: series[0] || null });
    } catch (error) {
      set({ error: comoTexto(error, "No se pudieron cargar las series del punto") });
    }
  },

  elegirSerie: (serie) => set({ serie }),

  refrescarSerie: async () => {
    const { puntoId, serie } = get();
    if (!puntoId) return;
    try {
      const series = await seriesDePunto(puntoId);
      set({ series, serie: series.find((s) => s.serie === serie?.serie) || series[0] || null });
    } catch (error) {
      console.warn("No se pudo refrescar la numeración:", error);
    }
  },

  clearAll: () => set({ ...VACIO }),
}));

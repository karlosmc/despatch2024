import apiLogged from "../api/axios.auth";
import { mensajeDeErrorApi } from "../utils/mensajeError";

export interface UsuarioResumen {
  id: number;
  name: string;
  documento?: string;
  email?: string;
  perfil?: string;
  estado?: string;
}

export const UserService = {
  /** Busca por documento si el texto es numérico; si no, por nombre. Vacío = todos. */
  buscar: async (texto = ""): Promise<UsuarioResumen[]> => {
    const limpio = texto.trim();
    const campo = /^\d+$/.test(limpio) ? "documento" : "name";
    try {
      const { data } = await apiLogged.get("/api/user/buscar", { params: { [campo]: limpio } });
      const lista = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      return lista as UsuarioResumen[];
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      throw mensajeDeErrorApi(error, "No se pudieron cargar los usuarios");
    }
  },
};

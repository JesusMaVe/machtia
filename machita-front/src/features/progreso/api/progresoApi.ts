import { fetchAPI } from "@/lib/api";
import type { Racha, Estadisticas, Logro, ActividadUsuario } from "../types";

export const progresoApi = {
  getRacha: async (): Promise<Racha> => {
    return fetchAPI<Racha>("/progreso/racha/");
  },

  getEstadisticas: async (): Promise<Estadisticas> => {
    return fetchAPI<Estadisticas>("/progreso/estadisticas/");
  },

  getLogros: async (): Promise<Logro[]> => {
    return fetchAPI<Logro[]>("/progreso/logros/");
  },

  getActividad: async (dias?: number): Promise<ActividadUsuario> => {
    let url = "/progreso/actividad/";

    if (dias) {
      url += `?dias=${dias}`;
    }

    return fetchAPI<ActividadUsuario>(url);
  },
};

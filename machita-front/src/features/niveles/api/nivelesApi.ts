import { fetchAPI } from "@/lib/api";
import type { Nivel } from "../types";

interface NivelWithLecciones {
  nivel: Nivel;
  lecciones: any[]; // Usar tipo Leccion cuando esté disponible
  total_lecciones: number;
}

export const nivelesApi = {
  list: async (): Promise<Nivel[]> => {
    let url = "/niveles/";
    return fetchAPI<Nivel[]>(url);
  },

  get: async (id: string): Promise<Nivel> => {
    return fetchAPI<Nivel>(`/niveles/${id}/`);
  },

  getLecciones: async (id: string): Promise<NivelWithLecciones> => {
    return fetchAPI<NivelWithLecciones>(`/niveles/${id}/lecciones/`);
  },

  getNext: async (): Promise<Nivel> => {
    return fetchAPI<Nivel>("/niveles/siguiente/");
  },

  complete: async (id: string): Promise<Nivel> => {
    return fetchAPI<Nivel>(`/niveles/${id}/completar/`, {
      method: "POST",
    });
  },
};

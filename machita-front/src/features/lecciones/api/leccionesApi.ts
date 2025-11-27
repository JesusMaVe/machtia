import { fetchAPI } from "@/lib/api";
import type { Leccion, ResultadoLeccion, FiltrosLecciones } from "../types";

export const leccionesApi = {
  list: async (filtros?: FiltrosLecciones): Promise<Leccion[]> => {
    let url = "/lecciones/";

    if (filtros) {
      const params = new URLSearchParams();

      if (filtros.dificultad) {
        params.append("dificultad", filtros.dificultad);
      }

      if (filtros.tema) {
        params.append("tema", filtros.tema);
      }

      if (filtros.nivel_id !== undefined) {
        params.append("nivel_id", String(filtros.nivel_id));
      }

      if (filtros.incluir_palabras !== undefined) {
        params.append("incluir_palabras", String(filtros.incluir_palabras));
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return fetchAPI<Leccion[]>(url);
  },

  get: async (id: string): Promise<Leccion> => {
    return fetchAPI<Leccion>(`/lecciones/${id}/`);
  },

  getNext: async (): Promise<Leccion> => {
    return fetchAPI<Leccion>("/lecciones/siguiente/");
  },

  complete: async (id: string): Promise<ResultadoLeccion> => {
    return fetchAPI<ResultadoLeccion>(`/lecciones/${id}/completar/`, {
      method: "POST",
    });
  },

  fail: async (id: string): Promise<{ vidasRestantes: number; mensaje: string }> => {
    return fetchAPI(`/lecciones/${id}/fallar/`, {
      method: "POST",
    });
  },
};

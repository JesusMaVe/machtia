import type { Leccion, ResultadoLeccion, FiltrosLecciones } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

function getAuthToken(): string | null {
  return sessionStorage.getItem("token");
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    const error = await response.json().catch(() => ({ message: "Error desconocido" }));
    // Backend puede enviar errores en formato: { status: "error", message: "..." } o { error: "..." }
    const errorMessage = error.message || error.error || `Error ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

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

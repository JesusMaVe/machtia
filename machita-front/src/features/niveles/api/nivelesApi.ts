import type { Nivel } from "../types";

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

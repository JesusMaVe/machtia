import type { Racha, Estadisticas, Logro, ActividadUsuario } from "../types";

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
      window.location.href = "/login";
      throw new Error("Sesión expirada");
    }

    const error = await response.json().catch(() => ({ message: "Error desconocido" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

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

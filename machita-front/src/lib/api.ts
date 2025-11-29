import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types/auth";

const API_BASE_URL = "http://localhost:8000/api";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
};

export const saveToken = (token: string): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("token", token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("token");
  }
};

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      removeToken();
      // Opcional: Redirigir al login o lanzar un evento global
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/";
      }
      throw new APIError(401, "Sesión expirada o no autorizado");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(response.status, data.message || "Error en la petición", data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new APIError(0, error.message);
    }

    throw new APIError(0, "Error desconocido");
  }
}

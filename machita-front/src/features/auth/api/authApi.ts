import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types";

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

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      throw new APIError(401, "Sesión expirada o no autorizado");
    }

    const data = await response.json();

    if (!response.ok) {
      // Backend puede enviar errores en formato: { status: "error", message: "..." } o { error: "..." }
      const errorMessage = data.message || data.error || `Error ${response.status}`;
      throw new APIError(response.status, errorMessage, data);
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

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  me: async (): Promise<{ status: string; user: User }> => {
    return fetchAPI<{ status: string; user: User }>("/auth/me/");
  },

  logout: async (): Promise<{ status: string; message: string }> => {
    return fetchAPI<{ status: string; message: string }>("/auth/logout/", {
      method: "POST",
    });
  },

  updateProfile: async (data: { nombre?: string }): Promise<{ status: string; user: User }> => {
    return fetchAPI<{ status: string; user: User }>("/auth/me/update/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

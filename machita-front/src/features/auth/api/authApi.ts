import { fetchAPI } from "@/lib/api";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types";

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

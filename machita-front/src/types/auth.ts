export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: "estudiante" | "profesor" | "admin";
  tomin: number;
  vidas: number;
  leccionActual: number;
  leccionesCompletadas: number[];
  createdAt: string;
  ultimaRegeneracionVida?: string;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  jti?: string;
}

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  user: User;
  token?: TokenData; // Opcional - solo para compatibilidad legacy (ahora viene en cookies httpOnly)
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  nombre: string;
  password: string;
}

export interface AuthError {
  status: "error";
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

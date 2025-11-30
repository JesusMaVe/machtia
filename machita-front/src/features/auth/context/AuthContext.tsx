import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, LoginCredentials, RegisterCredentials } from "../types";
import { authApi } from "../api/authApi";
import { APIError } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userOrUpdater: User | ((user: User) => User)) => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = user !== null;

  const checkAuth = useCallback(async () => {
    // SEGURIDAD: Con cookies httpOnly, no necesitamos verificar sessionStorage
    // El token se envía automáticamente con credentials: 'include'
    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {
      // Si error 401, el usuario no está autenticado (cookie expirada/inválida)
      if (error instanceof APIError && error.status === 401) {
        setUser(null);
      }
      // Para otros errores (red, servidor), no limpiar estado
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await checkAuth();
    };

    init();

    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      // SEGURIDAD: El token ahora viene en cookie httpOnly, no en response.token
      // Solo necesitamos establecer el user state
      setUser(response.user);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error("Error al iniciar sesión");
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authApi.register(credentials);
      // SEGURIDAD: El token ahora viene en cookie httpOnly, no en response.token
      // Solo necesitamos establecer el user state
      setUser(response.user);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message);
      }
      throw new Error("Error al registrar usuario");
    }
  };

  const logout = async () => {
    try {
      // SEGURIDAD: El backend eliminará las cookies httpOnly automáticamente
      await authApi.logout();
    } catch (error) {
      // Continuar con logout local incluso si falla la llamada al backend
    } finally {
      setUser(null);
    }
  };

  const updateUser = useCallback((userOrUpdater: User | ((user: User) => User)) => {
    if (typeof userOrUpdater === "function") {
      setUser((prevUser) => (prevUser ? userOrUpdater(prevUser) : null));
    } else {
      setUser(userOrUpdater);
    }
  }, []);

  const refreshUser = async () => {
    // SEGURIDAD: Con cookies httpOnly, no necesitamos verificar sessionStorage
    // El token se envía automáticamente con credentials: 'include'
    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {
      // Silencioso - si falla, mantener estado actual
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
}

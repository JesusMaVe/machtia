import { createContext, useContext, useState, useEffect } from "react";
import type { User, LoginCredentials, RegisterCredentials } from "../types";
import { authApi, saveToken, removeToken, APIError } from "../api/authApi";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      saveToken(response.token.access_token);
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
      saveToken(response.token.access_token);
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
      await authApi.logout();
    } catch (error) {
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

    if (!token) {
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {}
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

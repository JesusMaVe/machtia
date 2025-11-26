import type { User } from "@/features/auth/types";
import type { Leccion } from "@/features/lecciones/types";
import type { Nivel } from "@/features/niveles/types";
import type { Racha, Estadisticas, Logro } from "@/features/progreso/types";
import type { EstadoVidas } from "@/features/vidas/types";

// Mock Users
export const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  nombre: "Test User",
  tomin: 100,
  vidas: 3,
  leccionesCompletadas: [1, 2],
  leccionActual: 3,
  rol: "estudiante",
  createdAt: new Date().toISOString(),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: "admin-123",
  email: "admin@example.com",
  nombre: "Admin User",
  rol: "admin",
};

// Mock Lecciones
export const mockLeccion: Leccion = {
  id: "1",
  numero: 1,
  titulo: "Saludos Básicos",
  descripcion: "Aprende a saludar en náhuatl",
  dificultad: "principiante",
  tema: "conversacion",
  tomins: 10,
  completada: false,
  bloqueada: false,
  palabras: [
    {
      id: "1",
      nahuatl: "Niltze",
      espanol: "Hola",
      audio: "/audio/niltze.mp3",
      ejemplo: "Niltze, ¿quen tinemi?",
    },
    {
      id: "2",
      nahuatl: "Tlazohcamati",
      espanol: "Gracias",
      audio: "/audio/tlazohcamati.mp3",
      ejemplo: "Tlazohcamati cenca",
    },
  ],
};

export const mockLecciones: Leccion[] = [
  mockLeccion,
  {
    ...mockLeccion,
    id: "2",
    numero: 2,
    titulo: "Números 1-10",
    dificultad: "principiante",
    tema: "numeros",
    completada: true,
  },
  {
    ...mockLeccion,
    id: "3",
    numero: 3,
    titulo: "Familia",
    dificultad: "intermedio",
    tema: "familia",
    completada: false,
    bloqueada: true,
  },
];

// Mock Niveles
export const mockNivel: Nivel = {
  id: "1",
  titulo: "Principiante",
  numero: 1,
  descripcion: "Fundamentos del náhuatl",
  dificultad: "principiante",
  tema: "Básico",
  completado: false,
  bloqueado: false,
};

export const mockNiveles: Nivel[] = [
  mockNivel,
  {
    ...mockNivel,
    id: "2",
    titulo: "Intermedio",
    numero: 2,
    descripcion: "Profundiza tu conocimiento",
    dificultad: "intermedio",
    tema: "Intermedio",
    completado: false,
    bloqueado: true,
  },
  {
    ...mockNivel,
    id: "3",
    titulo: "Avanzado",
    numero: 3,
    descripcion: "Domina el náhuatl",
    dificultad: "avanzado",
    tema: "Avanzado",
    completado: false,
    bloqueado: true,
  },
];

// Mock Progreso
export const mockRacha: Racha = {
  diasActuales: 5,
  diasMaximos: 10,
  ultimaActividad: new Date().toISOString(),
  estado: "activa",
};

export const mockEstadisticas: Estadisticas = {
  leccionesCompletadas: 15,
  totalLecciones: 30,
  tominsAcumulados: 150,
  tominsGastados: 50,
  horasEstudio: 2,
  palabrasAprendidas: 45,
  nivel: "principiante",
  progreso: 50,
};

export const mockLogro: Logro = {
  id: "logro-1",
  nombre: "Primera Lección",
  descripcion: "Completa tu primera lección",
  icono: "🎯",
  requisito: "Completar 1 lección",
  desbloqueado: true,
  fechaDesbloqueo: new Date().toISOString(),
};

export const mockLogros: Logro[] = [
  mockLogro,
  {
    ...mockLogro,
    id: "logro-2",
    nombre: "Racha de 7 días",
    descripcion: "Mantén una racha de 7 días consecutivos",
    icono: "🔥",
    requisito: "Mantener racha de 7 días",
    desbloqueado: false,
    fechaDesbloqueo: undefined,
  },
];

// Mock Vidas
export const mockEstadoVidas: EstadoVidas = {
  vidasActuales: 3,
  vidasMaximas: 5,
  proximaVidaEn: 30,
  regeneracionActiva: true,
};

// Mock Auth Responses
export const mockLoginResponse = {
  user: mockUser,
  token: {
    access_token: "mock-jwt-token-123456",
  },
};

export const mockRegisterResponse = {
  user: mockUser,
  token: {
    access_token: "mock-jwt-token-789012",
  },
};

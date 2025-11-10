export const API_BASE_URL = "http://localhost:8000/api";

export const VIDAS_MAXIMAS = 5;
export const VIDAS_INICIALES = 3;
export const TIEMPO_REGENERACION_VIDA = 30; // minutos
export const COSTO_UNA_VIDA = 10; // tomins
export const COSTO_RESTAURAR_VIDAS = 50; // tomins

export const TOMINS_POR_LECCION_BASICA = 5;
export const TIEMPO_ESTIMADO_LECCION = 10; // minutos

export const DIFICULTADES = {
  PRINCIPIANTE: "principiante",
  INTERMEDIO: "intermedio",
  AVANZADO: "avanzado",
} as const;

export type Dificultad = (typeof DIFICULTADES)[keyof typeof DIFICULTADES];

export const ESTADOS_RACHA = {
  NUEVA: "nueva",
  ACTIVA: "activa",
  EN_RIESGO: "en_riesgo",
  PERDIDA: "perdida",
} as const;

export type EstadoRacha = (typeof ESTADOS_RACHA)[keyof typeof ESTADOS_RACHA];

export const MENSAJES_RACHA: Record<EstadoRacha, string> = {
  nueva: "Completa tu primera lección para empezar una racha.",
  activa: "¡Sigue así! Tu racha está activa.",
  en_riesgo: "¡No pierdas tu racha! Estudia hoy para mantenerla.",
  perdida: "Tu racha se perdió. ¡Empieza una nueva hoy!",
};

export const LOGROS = {
  PRIMERA_LECCION: {
    id: "primera_leccion",
    nombre: "Primera Lección",
    descripcion: "Completaste tu primera lección de Náhuatl",
    icono: "GraduationCap",
    requisito: "Completar 1 lección",
  },
  RACHA_7: {
    id: "racha_7",
    nombre: "Semana Completa",
    descripcion: "Mantuviste una racha de 7 días",
    icono: "Flame",
    requisito: "Racha de 7 días",
  },
  RACHA_30: {
    id: "racha_30",
    nombre: "Mes de Dedicación",
    descripcion: "Mantuviste una racha de 30 días",
    icono: "Trophy",
    requisito: "Racha de 30 días",
  },
  LECCIONES_10: {
    id: "lecciones_10",
    nombre: "Aprendiz Dedicado",
    descripcion: "Completaste 10 lecciones",
    icono: "BookOpen",
    requisito: "Completar 10 lecciones",
  },
  LECCIONES_50: {
    id: "lecciones_50",
    nombre: "Maestro del Náhuatl",
    descripcion: "Completaste 50 lecciones",
    icono: "Medal",
    requisito: "Completar 50 lecciones",
  },
  RICO: {
    id: "rico",
    nombre: "Rico en Tomins",
    descripcion: "Acumulaste 100 tomins totales",
    icono: "Coins",
    requisito: "Acumular 100 tomins totales",
  },
  MILLONARIO: {
    id: "millonario",
    nombre: "Millonario",
    descripcion: "Acumulaste 1000 tomins totales",
    icono: "Gem",
    requisito: "Acumular 1000 tomins totales",
  },
} as const;

export const RUTAS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  LECCIONES: "/lecciones",
  LECCION_PRACTICA: "/lecciones/:id",
  PROGRESO: "/progreso",
  PERFIL: "/perfil",
} as const;

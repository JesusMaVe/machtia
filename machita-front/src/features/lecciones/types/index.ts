import type { Dificultad } from "@/shared/constants";

export type Tema = string;

// Tipos de dinámicas de aprendizaje
export type TipoDinamica = "traduccion" | "seleccion_multiple" | "emparejamiento";

// Para selección múltiple
export interface OpcionMultiple {
  id: string;
  texto: string;
  esCorrecta: boolean;
}

// Para emparejamiento
export interface ParEmparejamiento {
  id: string;
  nahuatl: string;
  espanol: string;
}

export interface Palabra {
  id: string;
  nahuatl: string;
  espanol: string;
  audio: string; // URL del archivo de audio
  ejemplo?: string;
  categoria?: string;
}

export interface Leccion {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  tema?: Tema;
  palabras: Palabra[];
  tomins: number; // Tomins que se ganan al completar
  completada: boolean;
  bloqueada: boolean;
  estrellas?: number; // 0-3, opcional para futuras versiones
}

export interface LeccionesPorNivel {
  principiante: Leccion[];
  intermedio: Leccion[];
  avanzado: Leccion[];
}

export interface ResultadoLeccion {
  exito: boolean;
  tomins: number;
  mensaje: string;
  vidasRestantes: number;
  nuevosLogros?: string[]; // IDs de logros desbloqueados
}

export interface EstadoPractica {
  leccionId: string;
  palabraActual: number;
  totalPalabras: number;
  respuestasCorrectas: number;
  respuestasIncorrectas: number;
  dinamicaActual?: TipoDinamica;
  indexEnCiclo?: number; // Para controlar el ciclo de dinámicas
}

export interface FiltrosLecciones {
  dificultad?: Dificultad;
  tema?: Tema;
  nivel_id?: number;
  incluir_palabras?: boolean;
}

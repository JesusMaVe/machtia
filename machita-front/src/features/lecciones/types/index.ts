import type { Dificultad } from "@/shared/constants";

export type Tema = string;

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
}

export interface FiltrosLecciones {
  dificultad?: Dificultad;
  tema?: Tema;
  incluir_palabras?: boolean;
}

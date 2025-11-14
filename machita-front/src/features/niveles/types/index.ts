import type { Dificultad } from "@/shared/constants";

/**
 * Respuesta del backend actualizada:
 * {
 *   id: string;
 *   numero: number;
 *   titulo: string;
 *   descripcion: string;
 *   dificultad: 'principiante' | 'intermedio' | 'avanzado';
 *   tema: string;
 *   completado: boolean;
 *   bloqueado: boolean;
 *   progreso?: number;
 * }
 */
export interface Nivel {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  tema: string;
  completado: boolean;
  bloqueado: boolean;
  progreso?: number;
}

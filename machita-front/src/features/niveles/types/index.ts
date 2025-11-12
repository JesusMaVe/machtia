import type { Dificultad } from "@/shared/constants";

/*
  La respuesta provicional del backend es la siguiente:
  {
    id: string;
    numero: number;
    titulo: string;
    descripcion: string;
    dificultad: 'principiante' | 'intermedio' | 'avanzado';
    tema: string;
    completado: boolean;
    bloqueado: boolean;
    progreso?: number;
  }
  Es necesario realizar cambios a esta respuesta
*/
export interface Nivel {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  tema?: string;
  completada: boolean;
  bloqueada: boolean;
}

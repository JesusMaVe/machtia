import type { EstadoRacha } from "@/shared/constants";

export interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  requisito: string;
  desbloqueado: boolean;
  fechaDesbloqueo?: string;
}

export interface Racha {
  diasActuales: number;
  diasMaximos: number;
  estado: EstadoRacha;
  ultimaActividad: string;
  proximaExpiracion?: string; // Fecha/hora en que expira la racha
}

export interface Estadisticas {
  leccionesCompletadas: number;
  totalLecciones: number;
  tominsAcumulados: number;
  tominsGastados: number;
  horasEstudio: number;
  palabrasAprendidas: number;
  nivel: string;
  progreso: number; // 0-100
}

export interface DiaActividad {
  fecha: string;
  leccionesCompletadas: number;
  tominsGanados: number;
  tiempoEstudio: number; // minutos
}

export interface PeriodoActividad {
  dias: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface PromedioActividad {
  lecciones: number;
  tomins: number;
  tiempo: number; // minutos
}

export interface ActividadUsuario {
  periodo: PeriodoActividad;
  actividad: {
    totalLecciones: number;
    totalTomins: number;
    totalTiempo: number;
    diasConActividad: number;
    historial: DiaActividad[];
  };
  promedio: PromedioActividad;
}

export interface EstadoVidas {
  vidasActuales: number;
  vidasMaximas: number;
  proximaVidaEn?: number; // Minutos hasta la próxima vida
  regeneracionActiva: boolean;
}

export interface ResultadoCompra {
  exito: boolean;
  mensaje: string;
  vidasNuevas: number;
  tominsRestantes: number;
}

export interface OpcionCompra {
  tipo: "una_vida" | "restaurar_todas";
  costo: number;
  vidas: number;
  descripcion: string;
}

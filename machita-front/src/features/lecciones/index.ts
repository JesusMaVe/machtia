export { leccionesApi } from "./api/leccionesApi";

export type {
  Palabra,
  Leccion,
  LeccionesPorNivel,
  ResultadoLeccion,
  EstadoPractica,
  Tema,
  FiltrosLecciones,
  TipoDinamica,
  OpcionMultiple,
  ParEmparejamiento,
} from "./types";

export { NivelDificultadBadge } from "./components/molecules/NivelDificultadBadge";
export { LeccionCard } from "./components/molecules/LeccionCard";
export { PalabraCard } from "./components/molecules/PalabraCard";

export { LeccionesGrid } from "./components/organisms/LeccionesGrid";
export { LeccionDetalle } from "./components/organisms/LeccionDetalle";
export { DynamicaRouter } from "./components/organisms/DynamicaRouter";
export { DinamicaTraduccion } from "./components/organisms/DinamicaTraduccion";
export { SeleccionMultiple } from "./components/organisms/SeleccionMultiple";
export { Emparejamiento } from "./components/organisms/Emparejamiento";

// Utilidades
export {
  shuffle,
  generarOpcionesMultiple,
  generarParesEmparejamiento,
  obtenerSiguienteDinamica,
  obtenerDinamicaPorIndice,
  agruparPalabrasParaEmparejamiento,
} from "./utils/dinamicasUtils";

import type { Palabra, ParEmparejamiento, TipoDinamica } from "../types";

/**
 * Mezcla un array de forma aleatoria (Fisher-Yates shuffle)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Genera opciones para selección múltiple
 * @param palabraCorrecta - La palabra cuya traducción es la respuesta correcta
 * @param todasLasPalabras - Todas las palabras disponibles para crear distractores
 * @param numOpciones - Número total de opciones (default: 4)
 * @returns Array de strings con las opciones mezcladas
 */
export function generarOpcionesMultiple(
  palabraCorrecta: Palabra,
  todasLasPalabras: Palabra[],
  numOpciones: number = 4
): string[] {
  const opciones: string[] = [palabraCorrecta.espanol];

  // Filtrar distractores (traducciones de otras palabras)
  const distractores = todasLasPalabras
    .filter((p) => p.id !== palabraCorrecta.id && p.espanol !== palabraCorrecta.espanol)
    .map((p) => p.espanol);

  // Seleccionar distractores aleatorios
  const distractoresMezclados = shuffle(distractores);
  const cantidadDistractores = Math.min(numOpciones - 1, distractoresMezclados.length);
  opciones.push(...distractoresMezclados.slice(0, cantidadDistractores));

  // Si no hay suficientes distractores, rellenar con opciones genéricas
  while (opciones.length < numOpciones) {
    opciones.push(`Opción ${opciones.length + 1}`);
  }

  return shuffle(opciones);
}

/**
 * Genera pares para emparejamiento a partir de un grupo de palabras
 * @param palabras - Palabras a emparejar
 * @returns Array de pares para emparejamiento
 */
export function generarParesEmparejamiento(palabras: Palabra[]): ParEmparejamiento[] {
  return palabras.map((palabra) => ({
    id: palabra.id,
    nahuatl: palabra.nahuatl,
    espanol: palabra.espanol,
  }));
}

/**
 * Obtiene el siguiente tipo de dinámica en el ciclo
 * Ciclo: traduccion → seleccion_multiple → emparejamiento → traduccion...
 */
export function obtenerSiguienteDinamica(dinamicaActual: TipoDinamica): TipoDinamica {
  const ciclo: TipoDinamica[] = ["traduccion", "seleccion_multiple", "emparejamiento"];
  const indexActual = ciclo.indexOf(dinamicaActual);
  return ciclo[(indexActual + 1) % ciclo.length];
}

/**
 * Determina qué tipo de dinámica usar basándose en el índice del ejercicio
 * @param index - Índice del ejercicio (0-based)
 * @returns Tipo de dinámica a usar
 */
export function obtenerDinamicaPorIndice(index: number): TipoDinamica {
  const ciclo: TipoDinamica[] = ["traduccion", "seleccion_multiple", "emparejamiento"];
  return ciclo[index % ciclo.length];
}

/**
 * Agrupa palabras en grupos para emparejamiento
 * @param palabras - Array de palabras
 * @param tamanoGrupo - Tamaño de cada grupo (default: 3)
 * @returns Array de grupos de palabras
 */
export function agruparPalabrasParaEmparejamiento(
  palabras: Palabra[],
  tamanoGrupo: number = 3
): Palabra[][] {
  const grupos: Palabra[][] = [];
  for (let i = 0; i < palabras.length; i += tamanoGrupo) {
    grupos.push(palabras.slice(i, i + tamanoGrupo));
  }
  return grupos;
}

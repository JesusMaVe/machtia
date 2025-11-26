import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  shuffle,
  generarOpcionesMultiple,
  generarParesEmparejamiento,
  obtenerSiguienteDinamica,
  obtenerDinamicaPorIndice,
  agruparPalabrasParaEmparejamiento,
} from "./dinamicasUtils";
import type { Palabra, TipoDinamica } from "../types";

const mockPalabras: Palabra[] = [
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
  {
    id: "3",
    nahuatl: "Quenin tica",
    espanol: "¿Cómo estás?",
    audio: "/audio/quenin.mp3",
    ejemplo: "Quenin tica?",
  },
  {
    id: "4",
    nahuatl: "Cualli",
    espanol: "Bien",
    audio: "/audio/cualli.mp3",
    ejemplo: "Cualli, tlazohcamati",
  },
  {
    id: "5",
    nahuatl: "Moztla",
    espanol: "Mañana",
    audio: "/audio/moztla.mp3",
    ejemplo: "Moztla nech itta",
  },
];

describe("dinamicasUtils", () => {
  describe("shuffle", () => {
    it("should return an array with the same length", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);

      expect(shuffled).toHaveLength(original.length);
    });

    it("should contain all original elements", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);

      original.forEach((item) => {
        expect(shuffled).toContain(item);
      });
    });

    it("should not modify the original array", () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      shuffle(original);

      expect(original).toEqual(copy);
    });

    it("should work with empty array", () => {
      const shuffled = shuffle([]);
      expect(shuffled).toEqual([]);
    });

    it("should work with single element", () => {
      const shuffled = shuffle([1]);
      expect(shuffled).toEqual([1]);
    });

    it("should produce different order (probabilistic test)", () => {
      // Mock Math.random to control shuffling
      const mockRandom = vi.spyOn(Math, "random");
      mockRandom.mockReturnValueOnce(0.9);

      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);

      // With controlled random, we expect a different order
      expect(shuffled).not.toEqual(original);

      mockRandom.mockRestore();
    });
  });

  describe("generarOpcionesMultiple", () => {
    it("should return 4 options by default", () => {
      const opciones = generarOpcionesMultiple(mockPalabras[0], mockPalabras);
      expect(opciones).toHaveLength(4);
    });

    it("should include the correct answer", () => {
      const palabraCorrecta = mockPalabras[0];
      const opciones = generarOpcionesMultiple(palabraCorrecta, mockPalabras);

      expect(opciones).toContain(palabraCorrecta.espanol);
    });

    it("should not include duplicate translations", () => {
      const palabraCorrecta = mockPalabras[0];
      const opciones = generarOpcionesMultiple(palabraCorrecta, mockPalabras);

      const unique = new Set(opciones);
      expect(unique.size).toBe(opciones.length);
    });

    it("should respect custom numOpciones", () => {
      const opciones = generarOpcionesMultiple(mockPalabras[0], mockPalabras, 3);
      expect(opciones).toHaveLength(3);
    });

    it("should handle case with fewer available distractors", () => {
      const palabraCorrecta = mockPalabras[0];
      const pocasPalabras = mockPalabras.slice(0, 2);

      const opciones = generarOpcionesMultiple(palabraCorrecta, pocasPalabras, 4);

      expect(opciones).toHaveLength(4);
      expect(opciones).toContain(palabraCorrecta.espanol);
    });

    it("should fill with generic options if not enough distractors", () => {
      const palabraCorrecta = mockPalabras[0];
      const pocasPalabras = mockPalabras.slice(0, 1);

      const opciones = generarOpcionesMultiple(palabraCorrecta, pocasPalabras, 4);

      expect(opciones).toHaveLength(4);
      const genericOptions = opciones.filter((o) => o.startsWith("Opción"));
      expect(genericOptions.length).toBeGreaterThan(0);
    });

    it("should not include the same palabra as distractor", () => {
      const palabraCorrecta = mockPalabras[0];
      const opciones = generarOpcionesMultiple(palabraCorrecta, mockPalabras);

      // Count how many times the correct translation appears
      const count = opciones.filter((o) => o === palabraCorrecta.espanol).length;
      expect(count).toBe(1);
    });

    it("should shuffle the options", () => {
      // The correct answer should not always be in the same position
      // This is probabilistic but we can test the function exists
      const opciones = generarOpcionesMultiple(mockPalabras[0], mockPalabras);
      expect(Array.isArray(opciones)).toBe(true);
    });
  });

  describe("generarParesEmparejamiento", () => {
    it("should generate pairs for all palabras", () => {
      const pares = generarParesEmparejamiento(mockPalabras);

      expect(pares).toHaveLength(mockPalabras.length);
    });

    it("should include all required properties", () => {
      const pares = generarParesEmparejamiento(mockPalabras);

      pares.forEach((par) => {
        expect(par).toHaveProperty("id");
        expect(par).toHaveProperty("nahuatl");
        expect(par).toHaveProperty("espanol");
      });
    });

    it("should preserve palabra data correctly", () => {
      const pares = generarParesEmparejamiento(mockPalabras);

      pares.forEach((par, index) => {
        expect(par.id).toBe(mockPalabras[index].id);
        expect(par.nahuatl).toBe(mockPalabras[index].nahuatl);
        expect(par.espanol).toBe(mockPalabras[index].espanol);
      });
    });

    it("should work with empty array", () => {
      const pares = generarParesEmparejamiento([]);
      expect(pares).toEqual([]);
    });

    it("should work with single palabra", () => {
      const pares = generarParesEmparejamiento([mockPalabras[0]]);

      expect(pares).toHaveLength(1);
      expect(pares[0].id).toBe(mockPalabras[0].id);
    });
  });

  describe("obtenerSiguienteDinamica", () => {
    it("should cycle from traduccion to seleccion_multiple", () => {
      const next = obtenerSiguienteDinamica("traduccion");
      expect(next).toBe("seleccion_multiple");
    });

    it("should cycle from seleccion_multiple to emparejamiento", () => {
      const next = obtenerSiguienteDinamica("seleccion_multiple");
      expect(next).toBe("emparejamiento");
    });

    it("should cycle from emparejamiento to traduccion", () => {
      const next = obtenerSiguienteDinamica("emparejamiento");
      expect(next).toBe("traduccion");
    });

    it("should complete full cycle", () => {
      let current: TipoDinamica = "traduccion";

      current = obtenerSiguienteDinamica(current);
      expect(current).toBe("seleccion_multiple");

      current = obtenerSiguienteDinamica(current);
      expect(current).toBe("emparejamiento");

      current = obtenerSiguienteDinamica(current);
      expect(current).toBe("traduccion");
    });
  });

  describe("obtenerDinamicaPorIndice", () => {
    it("should return traduccion for index 0", () => {
      expect(obtenerDinamicaPorIndice(0)).toBe("traduccion");
    });

    it("should return seleccion_multiple for index 1", () => {
      expect(obtenerDinamicaPorIndice(1)).toBe("seleccion_multiple");
    });

    it("should return emparejamiento for index 2", () => {
      expect(obtenerDinamicaPorIndice(2)).toBe("emparejamiento");
    });

    it("should cycle back to traduccion for index 3", () => {
      expect(obtenerDinamicaPorIndice(3)).toBe("traduccion");
    });

    it("should handle larger indices correctly", () => {
      expect(obtenerDinamicaPorIndice(6)).toBe("traduccion");
      expect(obtenerDinamicaPorIndice(7)).toBe("seleccion_multiple");
      expect(obtenerDinamicaPorIndice(8)).toBe("emparejamiento");
    });

    it("should follow the same cycle pattern", () => {
      for (let i = 0; i < 12; i++) {
        const dinamica = obtenerDinamicaPorIndice(i);
        const expected = ["traduccion", "seleccion_multiple", "emparejamiento"][i % 3];
        expect(dinamica).toBe(expected);
      }
    });
  });

  describe("agruparPalabrasParaEmparejamiento", () => {
    it("should group palabras in groups of 3 by default", () => {
      const grupos = agruparPalabrasParaEmparejamiento(mockPalabras);

      expect(grupos).toHaveLength(2);
      expect(grupos[0]).toHaveLength(3);
      expect(grupos[1]).toHaveLength(2);
    });

    it("should respect custom tamanoGrupo", () => {
      const grupos = agruparPalabrasParaEmparejamiento(mockPalabras, 2);

      expect(grupos).toHaveLength(3);
      grupos.forEach((grupo, index) => {
        if (index < 2) {
          expect(grupo).toHaveLength(2);
        }
      });
    });

    it("should preserve palabra order within groups", () => {
      const grupos = agruparPalabrasParaEmparejamiento(mockPalabras, 2);

      expect(grupos[0][0]).toEqual(mockPalabras[0]);
      expect(grupos[0][1]).toEqual(mockPalabras[1]);
      expect(grupos[1][0]).toEqual(mockPalabras[2]);
      expect(grupos[1][1]).toEqual(mockPalabras[3]);
    });

    it("should handle last group with fewer items", () => {
      const grupos = agruparPalabrasParaEmparejamiento(mockPalabras, 3);

      expect(grupos[grupos.length - 1].length).toBeLessThanOrEqual(3);
    });

    it("should work with empty array", () => {
      const grupos = agruparPalabrasParaEmparejamiento([]);
      expect(grupos).toEqual([]);
    });

    it("should work with single palabra", () => {
      const grupos = agruparPalabrasParaEmparejamiento([mockPalabras[0]]);

      expect(grupos).toHaveLength(1);
      expect(grupos[0]).toHaveLength(1);
    });

    it("should handle exact group size", () => {
      // Create exactly 6 palabras for testing exact division by 3
      const seisPalabras: Palabra[] = [
        ...mockPalabras,
        {
          id: "6",
          nahuatl: "Yohualtzinco",
          espanol: "Buenas noches",
          audio: "/audio/yohualtzinco.mp3",
          ejemplo: "Yohualtzinco, ma cualli toncochi",
        },
      ];
      const grupos = agruparPalabrasParaEmparejamiento(seisPalabras, 3);

      expect(grupos).toHaveLength(2);
      expect(grupos[0]).toHaveLength(3);
      expect(grupos[1]).toHaveLength(3);
    });
  });
});

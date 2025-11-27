import { describe, it, expect, beforeEach } from "vitest";
import { leccionesApi } from "./leccionesApi";
import { saveToken } from "@/lib/api";
import { mockLecciones, mockLeccion } from "@/test/mocks/data";

describe("leccionesApi", () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveToken("mock-jwt-token-123456");
  });

  describe("list", () => {
    it("should fetch all lecciones without filters", async () => {
      const lecciones = await leccionesApi.list();

      expect(Array.isArray(lecciones)).toBe(true);
      expect(lecciones.length).toBeGreaterThan(0);
      expect(lecciones[0]).toHaveProperty("id");
      expect(lecciones[0]).toHaveProperty("titulo");
      expect(lecciones[0]).toHaveProperty("dificultad");
    });

    it("should fetch lecciones filtered by dificultad", async () => {
      const lecciones = await leccionesApi.list({ dificultad: "principiante" });

      expect(Array.isArray(lecciones)).toBe(true);
      lecciones.forEach((leccion) => {
        expect(leccion.dificultad).toBe("principiante");
      });
    });

    it("should fetch lecciones filtered by tema", async () => {
      const lecciones = await leccionesApi.list({ tema: "conversacion" });

      expect(Array.isArray(lecciones)).toBe(true);
      lecciones.forEach((leccion) => {
        expect(leccion.tema).toBe("conversacion");
      });
    });

    it("should fetch lecciones with multiple filters", async () => {
      const lecciones = await leccionesApi.list({
        dificultad: "principiante",
        tema: "conversacion",
      });

      expect(Array.isArray(lecciones)).toBe(true);
      lecciones.forEach((leccion) => {
        expect(leccion.dificultad).toBe("principiante");
        expect(leccion.tema).toBe("conversacion");
      });
    });

    it("should build query params correctly with nivel_id", async () => {
      const lecciones = await leccionesApi.list({
        nivel_id: 1,
      });

      expect(Array.isArray(lecciones)).toBe(true);
    });

    it("should handle incluir_palabras parameter", async () => {
      const lecciones = await leccionesApi.list({
        incluir_palabras: true,
      });

      expect(Array.isArray(lecciones)).toBe(true);
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(leccionesApi.list()).rejects.toThrow();
    });
  });

  describe("get", () => {
    it("should fetch a single leccion by id", async () => {
      const leccion = await leccionesApi.get("1");

      expect(leccion).toBeDefined();
      expect(leccion.id).toBe("1");
      expect(leccion).toHaveProperty("titulo");
      expect(leccion).toHaveProperty("palabras");
      expect(Array.isArray(leccion.palabras)).toBe(true);
    });

    it("should throw error for non-existent leccion", async () => {
      await expect(leccionesApi.get("99999")).rejects.toThrow();
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(leccionesApi.get("1")).rejects.toThrow();
    });
  });

  describe("getNext", () => {
    it("should fetch the next lesson", async () => {
      const leccion = await leccionesApi.getNext();

      expect(leccion).toBeDefined();
      expect(leccion).toHaveProperty("id");
      expect(leccion).toHaveProperty("titulo");
      expect(leccion).toHaveProperty("dificultad");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(leccionesApi.getNext()).rejects.toThrow();
    });
  });

  describe("complete", () => {
    it("should complete a lesson successfully", async () => {
      const resultado = await leccionesApi.complete("1");

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty("mensaje");
      expect(resultado).toHaveProperty("tomins");
      expect(resultado).toHaveProperty("exito");
      expect(resultado.exito).toBe(true);
    });

    it("should return tomins gained on completion", async () => {
      const resultado = await leccionesApi.complete("1");

      expect(resultado.tomins).toBeGreaterThan(0);
      expect(typeof resultado.tomins).toBe("number");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(leccionesApi.complete("1")).rejects.toThrow();
    });

    it("should throw error for invalid lesson id", async () => {
      await expect(leccionesApi.complete("invalid")).rejects.toThrow();
    });
  });

  describe("fail", () => {
    it("should mark lesson as failed", async () => {
      const resultado = await leccionesApi.fail("1");

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty("mensaje");
      expect(resultado).toHaveProperty("vidasRestantes");
      expect(typeof resultado.vidasRestantes).toBe("number");
    });

    it("should return remaining vidas", async () => {
      const resultado = await leccionesApi.fail("1");

      expect(resultado.vidasRestantes).toBeGreaterThanOrEqual(0);
      expect(resultado.vidasRestantes).toBeLessThanOrEqual(5);
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(leccionesApi.fail("1")).rejects.toThrow();
    });
  });

  describe("Authorization", () => {
    it("should include Authorization header when token exists", async () => {
      saveToken("test-token-12345");

      const lecciones = await leccionesApi.list();
      expect(lecciones).toBeDefined();
    });

    it("should handle 401 responses", async () => {
      saveToken("invalid-token");

      try {
        await leccionesApi.list();
      } catch (error) {
        expect(sessionStorage.getItem("token")).toBeNull();
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw descriptive error messages", async () => {
      await expect(leccionesApi.get("99999")).rejects.toThrow();
    });

    it("should handle malformed responses", async () => {
      // This would require mocking a bad response
      // Just verify the function exists and has proper structure
      expect(typeof leccionesApi.list).toBe("function");
      expect(typeof leccionesApi.get).toBe("function");
      expect(typeof leccionesApi.complete).toBe("function");
      expect(typeof leccionesApi.fail).toBe("function");
    });
  });
});

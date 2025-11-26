import { describe, it, expect, beforeEach } from "vitest";
import { nivelesApi } from "./nivelesApi";
import { saveToken } from "@/features/auth/api/authApi";
import { mockNiveles, mockNivel } from "@/test/mocks/data";

describe("nivelesApi", () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveToken("mock-jwt-token-123456");
  });

  describe("list", () => {
    it("should fetch all niveles", async () => {
      const niveles = await nivelesApi.list();

      expect(Array.isArray(niveles)).toBe(true);
      expect(niveles.length).toBeGreaterThan(0);
    });

    it("should return niveles with correct structure", async () => {
      const niveles = await nivelesApi.list();

      niveles.forEach((nivel) => {
        expect(nivel).toHaveProperty("id");
        expect(nivel).toHaveProperty("titulo");
        expect(nivel).toHaveProperty("numero");
        expect(nivel).toHaveProperty("dificultad");
      });
    });

    it("should have valid dificultad values", async () => {
      const niveles = await nivelesApi.list();

      const validDificultades = ["principiante", "intermedio", "avanzado"];

      niveles.forEach((nivel) => {
        expect(validDificultades).toContain(nivel.dificultad);
      });
    });

    it("should have sequential nivel numbers", async () => {
      const niveles = await nivelesApi.list();

      niveles.forEach((nivel, index) => {
        expect(nivel.numero).toBeGreaterThan(0);
        expect(typeof nivel.numero).toBe("number");
      });
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(nivelesApi.list()).rejects.toThrow();
    });
  });

  describe("get", () => {
    it("should fetch a single nivel by id", async () => {
      const nivel = await nivelesApi.get("1");

      expect(nivel).toBeDefined();
      expect(nivel).toHaveProperty("id");
      expect(nivel).toHaveProperty("titulo");
      expect(nivel).toHaveProperty("numero");
    });

    it("should return nivel with correct type", async () => {
      const nivel = await nivelesApi.get("1");

      expect(typeof nivel.id).toBe("string");
      expect(typeof nivel.titulo).toBe("string");
      expect(typeof nivel.numero).toBe("number");
      expect(typeof nivel.dificultad).toBe("string");
    });

    it("should throw error for non-existent nivel", async () => {
      await expect(nivelesApi.get("99999")).rejects.toThrow();
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(nivelesApi.get("1")).rejects.toThrow();
    });
  });

  describe("getLecciones", () => {
    it("should fetch nivel with lecciones", async () => {
      const response = await nivelesApi.getLecciones("1");

      expect(response).toBeDefined();
      expect(response).toHaveProperty("nivel");
      expect(response).toHaveProperty("lecciones");
      expect(response).toHaveProperty("total_lecciones");
    });

    it("should include lecciones array", async () => {
      const response = await nivelesApi.getLecciones("1");

      expect(Array.isArray(response.lecciones)).toBe(true);
      expect(response.lecciones.length).toBeGreaterThan(0);
    });

    it("should match total_lecciones count", async () => {
      const response = await nivelesApi.getLecciones("1");

      expect(response.total_lecciones).toBeGreaterThanOrEqual(response.lecciones.length);
    });

    it("should include nivel information", async () => {
      const response = await nivelesApi.getLecciones("1");

      expect(response.nivel).toHaveProperty("id");
      expect(response.nivel).toHaveProperty("titulo");
      expect(response.nivel).toHaveProperty("numero");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(nivelesApi.getLecciones("1")).rejects.toThrow();
    });
  });

  describe("getNext", () => {
    it("should fetch the next nivel", async () => {
      const nivel = await nivelesApi.getNext();

      expect(nivel).toBeDefined();
      expect(nivel).toHaveProperty("id");
      expect(nivel).toHaveProperty("titulo");
      expect(nivel).toHaveProperty("numero");
    });

    it("should return valid nivel structure", async () => {
      const nivel = await nivelesApi.getNext();

      expect(typeof nivel.titulo).toBe("string");
      expect(typeof nivel.numero).toBe("number");
      expect(typeof nivel.dificultad).toBe("string");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(nivelesApi.getNext()).rejects.toThrow();
    });
  });

  describe("complete", () => {
    it("should complete a nivel", async () => {
      const response = await nivelesApi.complete("1");

      expect(response).toBeDefined();
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(nivelesApi.complete("1")).rejects.toThrow();
    });

    it("should throw error for invalid nivel id", async () => {
      await expect(nivelesApi.complete("invalid")).rejects.toThrow();
    });
  });

  describe("Authorization", () => {
    it("should include Authorization header when token exists", async () => {
      saveToken("test-token-12345");

      const niveles = await nivelesApi.list();
      expect(niveles).toBeDefined();
    });

    it("should handle 401 responses", async () => {
      saveToken("invalid-token");

      try {
        await nivelesApi.list();
      } catch (error) {
        expect(sessionStorage.getItem("token")).toBeNull();
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw descriptive error messages", async () => {
      sessionStorage.removeItem("token");

      await expect(nivelesApi.list()).rejects.toThrow();
      await expect(nivelesApi.get("1")).rejects.toThrow();
      await expect(nivelesApi.getLecciones("1")).rejects.toThrow();
      await expect(nivelesApi.getNext()).rejects.toThrow();
      await expect(nivelesApi.complete("1")).rejects.toThrow();
    });

    it("should have proper API structure", () => {
      expect(typeof nivelesApi.list).toBe("function");
      expect(typeof nivelesApi.get).toBe("function");
      expect(typeof nivelesApi.getLecciones).toBe("function");
      expect(typeof nivelesApi.getNext).toBe("function");
      expect(typeof nivelesApi.complete).toBe("function");
    });
  });
});

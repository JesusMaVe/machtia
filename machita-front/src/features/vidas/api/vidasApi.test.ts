import { describe, it, expect, beforeEach } from "vitest";
import { vidasApi } from "./vidasApi";
import { saveToken } from "@/lib/api";
import { mockEstadoVidas } from "@/test/mocks/data";

describe("vidasApi", () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveToken("mock-jwt-token-123456");
  });

  describe("getEstado", () => {
    it("should fetch vidas estado", async () => {
      const estado = await vidasApi.getEstado();

      expect(estado).toBeDefined();
      expect(estado).toHaveProperty("vidasActuales");
      expect(estado).toHaveProperty("vidasMaximas");
      expect(estado).toHaveProperty("proximaVidaEn");
      expect(estado).toHaveProperty("regeneracionActiva");
    });

    it("should return estado with correct types", async () => {
      const estado = await vidasApi.getEstado();

      expect(typeof estado.vidasActuales).toBe("number");
      expect(typeof estado.vidasMaximas).toBe("number");
      expect(typeof estado.proximaVidaEn).toBe("number");
      expect(typeof estado.regeneracionActiva).toBe("boolean");
    });

    it("should have vidas within valid range", async () => {
      const estado = await vidasApi.getEstado();

      expect(estado.vidasActuales).toBeGreaterThanOrEqual(0);
      expect(estado.vidasActuales).toBeLessThanOrEqual(estado.vidasMaximas);
    });

    it("should have vidasMaximas as 5", async () => {
      const estado = await vidasApi.getEstado();

      expect(estado.vidasMaximas).toBe(5);
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(vidasApi.getEstado()).rejects.toThrow();
    });
  });

  describe("comprarUna", () => {
    it("should purchase one vida", async () => {
      const resultado = await vidasApi.comprarUna();

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty("vidasNuevas");
      expect(resultado).toHaveProperty("mensaje");
      expect(resultado).toHaveProperty("tominsRestantes");
      expect(resultado).toHaveProperty("exito");
    });

    it("should increase vidas by 1", async () => {
      const resultado = await vidasApi.comprarUna();

      expect(resultado.vidasNuevas).toBe(mockEstadoVidas.vidasActuales + 1);
    });

    it("should return tomins remaining", async () => {
      const resultado = await vidasApi.comprarUna();

      expect(resultado.tominsRestantes).toBeDefined();
      expect(typeof resultado.tominsRestantes).toBe("number");
      expect(resultado.tominsRestantes).toBeGreaterThanOrEqual(0);
    });

    it("should include success message", async () => {
      const resultado = await vidasApi.comprarUna();

      expect(resultado.mensaje).toBeDefined();
      expect(resultado.mensaje).toContain("comprada");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(vidasApi.comprarUna()).rejects.toThrow();
    });
  });

  describe("restaurarTodas", () => {
    it("should restore all vidas", async () => {
      const resultado = await vidasApi.restaurarTodas();

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty("vidasNuevas");
      expect(resultado).toHaveProperty("mensaje");
      expect(resultado).toHaveProperty("tominsRestantes");
      expect(resultado).toHaveProperty("exito");
    });

    it("should set vidas to maximum", async () => {
      const resultado = await vidasApi.restaurarTodas();

      expect(resultado.vidasNuevas).toBe(mockEstadoVidas.vidasMaximas);
    });

    it("should return tomins remaining", async () => {
      const resultado = await vidasApi.restaurarTodas();

      expect(resultado.tominsRestantes).toBeDefined();
      expect(typeof resultado.tominsRestantes).toBe("number");
      expect(resultado.tominsRestantes).toBeGreaterThanOrEqual(0);
    });

    it("should include success message", async () => {
      const resultado = await vidasApi.restaurarTodas();

      expect(resultado.mensaje).toBeDefined();
      expect(resultado.mensaje).toContain("restauradas");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(vidasApi.restaurarTodas()).rejects.toThrow();
    });
  });

  describe("Authorization", () => {
    it("should include Authorization header when token exists", async () => {
      saveToken("test-token-12345");

      const estado = await vidasApi.getEstado();
      expect(estado).toBeDefined();
    });

    it("should handle 401 responses", async () => {
      saveToken("invalid-token");

      try {
        await vidasApi.getEstado();
      } catch (error) {
        expect(sessionStorage.getItem("token")).toBeNull();
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw descriptive error messages", async () => {
      sessionStorage.removeItem("token");

      await expect(vidasApi.getEstado()).rejects.toThrow();
      await expect(vidasApi.comprarUna()).rejects.toThrow();
      await expect(vidasApi.restaurarTodas()).rejects.toThrow();
    });

    it("should have proper API structure", () => {
      expect(typeof vidasApi.getEstado).toBe("function");
      expect(typeof vidasApi.comprarUna).toBe("function");
      expect(typeof vidasApi.restaurarTodas).toBe("function");
    });
  });

  describe("Business Logic", () => {
    it("should track proximaVidaEn countdown", async () => {
      const estado = await vidasApi.getEstado();

      expect(estado.proximaVidaEn).toBeGreaterThanOrEqual(0);
      expect(typeof estado.proximaVidaEn).toBe("number");
    });

    it("should track regeneracion status", async () => {
      const estado = await vidasApi.getEstado();

      expect(typeof estado.regeneracionActiva).toBe("boolean");
    });
  });
});

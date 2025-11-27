import { describe, it, expect, beforeEach } from "vitest";
import { progresoApi } from "./progresoApi";
import { saveToken } from "@/lib/api";
import { mockRacha, mockEstadisticas, mockLogros } from "@/test/mocks/data";

describe("progresoApi", () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveToken("mock-jwt-token-123456");
  });

  describe("getRacha", () => {
    it("should fetch user racha", async () => {
      const racha = await progresoApi.getRacha();

      expect(racha).toBeDefined();
      expect(racha).toHaveProperty("diasActuales");
      expect(racha).toHaveProperty("diasMaximos");
      expect(racha).toHaveProperty("estado");
      expect(racha).toHaveProperty("ultimaActividad");
    });

    it("should return racha with correct types", async () => {
      const racha = await progresoApi.getRacha();

      expect(typeof racha.diasActuales).toBe("number");
      expect(typeof racha.diasMaximos).toBe("number");
      expect(typeof racha.estado).toBe("string");
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(progresoApi.getRacha()).rejects.toThrow();
    });

    it("should have valid estado values", async () => {
      const racha = await progresoApi.getRacha();

      const validEstados = ["nueva", "activa", "en_riesgo", "perdida"];
      expect(validEstados).toContain(racha.estado);
    });
  });

  describe("getEstadisticas", () => {
    it("should fetch user estadisticas", async () => {
      const estadisticas = await progresoApi.getEstadisticas();

      expect(estadisticas).toBeDefined();
      expect(estadisticas).toHaveProperty("leccionesCompletadas");
      expect(estadisticas).toHaveProperty("totalLecciones");
      expect(estadisticas).toHaveProperty("tominsAcumulados");
    });

    it("should return estadisticas with correct types", async () => {
      const estadisticas = await progresoApi.getEstadisticas();

      expect(typeof estadisticas.leccionesCompletadas).toBe("number");
      expect(typeof estadisticas.totalLecciones).toBe("number");
      expect(typeof estadisticas.tominsAcumulados).toBe("number");
      expect(typeof estadisticas.tominsGastados).toBe("number");
      expect(typeof estadisticas.horasEstudio).toBe("number");
    });

    it("should have valid percentage for progreso", async () => {
      const estadisticas = await progresoApi.getEstadisticas();

      expect(estadisticas.progreso).toBeGreaterThanOrEqual(0);
      expect(estadisticas.progreso).toBeLessThanOrEqual(100);
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(progresoApi.getEstadisticas()).rejects.toThrow();
    });
  });

  describe("getLogros", () => {
    it("should fetch user logros", async () => {
      const logros = await progresoApi.getLogros();

      expect(Array.isArray(logros)).toBe(true);
      expect(logros.length).toBeGreaterThan(0);
    });

    it("should return logros with correct structure", async () => {
      const logros = await progresoApi.getLogros();

      logros.forEach((logro) => {
        expect(logro).toHaveProperty("id");
        expect(logro).toHaveProperty("nombre");
        expect(logro).toHaveProperty("descripcion");
        expect(logro).toHaveProperty("icono");
        expect(logro).toHaveProperty("desbloqueado");
      });
    });

    it("should have valid desbloqueado boolean", async () => {
      const logros = await progresoApi.getLogros();

      logros.forEach((logro) => {
        expect(typeof logro.desbloqueado).toBe("boolean");
      });
    });

    it("should have fechaDesbloqueo for unlocked logros", async () => {
      const logros = await progresoApi.getLogros();

      logros.forEach((logro) => {
        if (logro.desbloqueado) {
          expect(logro.fechaDesbloqueo).toBeDefined();
        }
      });
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(progresoApi.getLogros()).rejects.toThrow();
    });
  });

  describe("getActividad", () => {
    it("should fetch user actividad without dias parameter", async () => {
      const actividad = await progresoApi.getActividad();

      expect(actividad).toBeDefined();
      expect(actividad).toHaveProperty("actividad");
      expect(actividad).toHaveProperty("periodo");
      expect(actividad.actividad).toHaveProperty("historial");
      expect(Array.isArray(actividad.actividad.historial)).toBe(true);
    });

    it("should fetch user actividad with dias parameter", async () => {
      const actividad = await progresoApi.getActividad(7);

      expect(actividad).toBeDefined();
      expect(actividad).toHaveProperty("periodo");
      expect(actividad.periodo.dias).toBe(7);
    });

    it("should build query params correctly", async () => {
      const actividad30 = await progresoApi.getActividad(30);
      const actividad7 = await progresoApi.getActividad(7);

      expect(actividad30.periodo.dias).toBe(30);
      expect(actividad7.periodo.dias).toBe(7);
    });

    it("should default to 30 days if not specified", async () => {
      const actividad = await progresoApi.getActividad();

      expect(actividad.periodo.dias).toBe(30);
    });

    it("should throw error without authentication", async () => {
      sessionStorage.removeItem("token");

      await expect(progresoApi.getActividad()).rejects.toThrow();
    });

    it("should handle different day ranges", async () => {
      const ranges = [7, 14, 30, 90];

      for (const dias of ranges) {
        const actividad = await progresoApi.getActividad(dias);
        expect(actividad.periodo.dias).toBe(dias);
      }
    });
  });

  describe("Authorization", () => {
    it("should include Authorization header when token exists", async () => {
      saveToken("test-token-12345");

      const racha = await progresoApi.getRacha();
      expect(racha).toBeDefined();
    });

    it("should handle 401 responses", async () => {
      saveToken("invalid-token");

      try {
        await progresoApi.getRacha();
      } catch (error) {
        expect(sessionStorage.getItem("token")).toBeNull();
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw descriptive error messages", async () => {
      sessionStorage.removeItem("token");

      await expect(progresoApi.getRacha()).rejects.toThrow();
      await expect(progresoApi.getEstadisticas()).rejects.toThrow();
      await expect(progresoApi.getLogros()).rejects.toThrow();
      await expect(progresoApi.getActividad()).rejects.toThrow();
    });

    it("should have proper API structure", () => {
      expect(typeof progresoApi.getRacha).toBe("function");
      expect(typeof progresoApi.getEstadisticas).toBe("function");
      expect(typeof progresoApi.getLogros).toBe("function");
      expect(typeof progresoApi.getActividad).toBe("function");
    });
  });
});

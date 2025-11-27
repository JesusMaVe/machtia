import { describe, it, expect, beforeEach, vi } from "vitest";
import { authApi } from "./authApi";
import { saveToken, removeToken, APIError } from "@/lib/api";
import { mockLoginResponse, mockRegisterResponse, mockUser } from "@/test/mocks/data";

describe("authApi", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe("Token Management", () => {
    it("should save token to sessionStorage", () => {
      saveToken("test-token");
      expect(sessionStorage.getItem("token")).toBe("test-token");
    });

    it("should remove token from sessionStorage", () => {
      sessionStorage.setItem("token", "test-token");
      removeToken();
      expect(sessionStorage.getItem("token")).toBeNull();
    });
  });

  describe("APIError", () => {
    it("should create APIError with status and message", () => {
      const error = new APIError(404, "Not found");
      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(404);
      expect(error.message).toBe("Not found");
      expect(error.name).toBe("APIError");
    });

    it("should create APIError with optional data", () => {
      const error = new APIError(400, "Bad request", { field: "email" });
      expect(error.data).toEqual({ field: "email" });
    });
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const credentials = {
        email: "new@example.com",
        nombre: "New User",
        password: "password123",
      };

      const response = await authApi.register(credentials);

      expect(response).toHaveProperty("user");
      expect(response).toHaveProperty("token");
      expect(response.user.email).toBe(mockUser.email);
    });

    it("should throw APIError on registration failure", async () => {
      const credentials = {
        email: "invalid",
        nombre: "",
        password: "123",
      };

      await expect(authApi.register(credentials)).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await authApi.login(credentials);

      expect(response).toEqual(mockLoginResponse);
      expect(response.user).toBeDefined();
      expect(response.token).toBeDefined();
    });

    it("should throw APIError with invalid credentials", async () => {
      const credentials = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      await expect(authApi.login(credentials)).rejects.toThrow(APIError);
      await expect(authApi.login(credentials)).rejects.toThrow("Invalid credentials");
    });

    it("should have 400 status on invalid credentials", async () => {
      const credentials = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      try {
        await authApi.login(credentials);
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(400);
      }
    });
  });

  describe("me", () => {
    it("should fetch current user with valid token", async () => {
      saveToken("mock-jwt-token-123456");

      const response = await authApi.me();

      expect(response.user).toEqual(mockUser);
    });

    it("should throw APIError without token", async () => {
      removeToken();

      await expect(authApi.me()).rejects.toThrow(APIError);
      await expect(authApi.me()).rejects.toThrow(/no autorizado|Unauthorized/i);
    });

    it("should remove token on 401 response", async () => {
      saveToken("invalid-token");

      try {
        await authApi.me();
      } catch (error) {
        expect(sessionStorage.getItem("token")).toBeNull();
      }
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      saveToken("mock-jwt-token-123456");

      const response = await authApi.logout();

      expect(response).toHaveProperty("message");
      expect(response.message).toContain("Logged out");
    });

    it("should handle logout even without token", async () => {
      removeToken();

      const response = await authApi.logout();
      expect(response).toHaveProperty("message");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      saveToken("mock-jwt-token-123456");

      const response = await authApi.updateProfile({ nombre: "Updated Name" });

      expect(response.user.nombre).toBe("Updated Name");
    });

    it("should throw APIError without token", async () => {
      removeToken();

      await expect(authApi.updateProfile({ nombre: "New Name" })).rejects.toThrow(APIError);
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      // Mock fetch to throw network error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(authApi.login({ email: "test", password: "test" })).rejects.toThrow(
        "Network error"
      );

      global.fetch = originalFetch;
    });
  });
});

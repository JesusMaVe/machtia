import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, getPasswordStrength } from "./validations";
import { ZodError } from "zod";

describe("Authentication Validations", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.parse(validData);
      expect(result.email).toBe("test@example.com");
      expect(result.password).toBe("password123");
    });

    it("should convert email to lowercase", () => {
      const data = {
        email: "Test@Example.COM",
        password: "password123",
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe("test@example.com");
    });

    it("should reject empty email", () => {
      const data = {
        email: "",
        password: "password123",
      };

      expect(() => loginSchema.parse(data)).toThrow(ZodError);
    });

    it("should reject invalid email format", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "test@",
        "test@.com",
        "test @example.com",
      ];

      invalidEmails.forEach((email) => {
        expect(() => loginSchema.parse({ email, password: "password123" })).toThrow(ZodError);
      });
    });

    it("should reject empty password", () => {
      const data = {
        email: "test@example.com",
        password: "",
      };

      expect(() => loginSchema.parse(data)).toThrow(ZodError);
      expect(() => loginSchema.parse(data)).toThrow(/contraseña es requerida/i);
    });
  });

  describe("registerSchema", () => {
    const validRegisterData = {
      email: "test@example.com",
      nombre: "Test User",
      password: "Password123",
      confirmPassword: "Password123",
    };

    it("should validate correct registration data", () => {
      const result = registerSchema.parse(validRegisterData);
      expect(result.email).toBe("test@example.com");
      expect(result.nombre).toBe("Test User");
      expect(result.password).toBe("Password123");
    });

    it("should convert email to lowercase", () => {
      const data = {
        ...validRegisterData,
        email: "Test@EXAMPLE.com",
      };

      const result = registerSchema.parse(data);
      expect(result.email).toBe("test@example.com");
    });

    it("should trim nombre", () => {
      const data = {
        ...validRegisterData,
        nombre: "  Test User  ",
      };

      const result = registerSchema.parse(data);
      expect(result.nombre).toBe("Test User");
    });

    it("should reject empty nombre", () => {
      const data = {
        ...validRegisterData,
        nombre: "",
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/nombre es requerido/i);
    });

    it("should reject nombre longer than 100 characters", () => {
      const data = {
        ...validRegisterData,
        nombre: "a".repeat(101),
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/100 caracteres/i);
    });

    it("should reject password shorter than 8 characters", () => {
      const data = {
        ...validRegisterData,
        password: "Pass1",
        confirmPassword: "Pass1",
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/8 caracteres/i);
    });

    it("should reject password without uppercase letter", () => {
      const data = {
        ...validRegisterData,
        password: "password123",
        confirmPassword: "password123",
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/mayúscula/i);
    });

    it("should reject password without lowercase letter", () => {
      const data = {
        ...validRegisterData,
        password: "PASSWORD123",
        confirmPassword: "PASSWORD123",
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/minúscula/i);
    });

    it("should reject password without number", () => {
      const data = {
        ...validRegisterData,
        password: "Password",
        confirmPassword: "Password",
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/número/i);
    });

    it("should reject non-matching passwords", () => {
      const data = {
        ...validRegisterData,
        password: "Password123",
        confirmPassword: "Password456",
      };

      expect(() => registerSchema.parse(data)).toThrow(ZodError);
      expect(() => registerSchema.parse(data)).toThrow(/no coinciden/i);
    });

    it("should accept strong password with all requirements", () => {
      const data = {
        ...validRegisterData,
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
      };

      const result = registerSchema.parse(data);
      expect(result.password).toBe("StrongPassword123!");
    });
  });

  describe("getPasswordStrength", () => {
    it('should return "weak" for short password', () => {
      const result = getPasswordStrength("pass");
      expect(result.strength).toBe("weak");
      expect(result.score).toBeLessThanOrEqual(2);
    });

    it('should return "weak" for password with only lowercase', () => {
      const result = getPasswordStrength("password");
      expect(result.strength).toBe("weak");
    });

    it('should return "medium" for password with 8+ chars, upper, lower, number', () => {
      const result = getPasswordStrength("Password1");
      expect(result.strength).toBe("medium");
      expect(result.score).toBeGreaterThan(2);
      expect(result.score).toBeLessThanOrEqual(4);
    });

    it('should return "strong" for password with 12+ chars, upper, lower, number, special', () => {
      const result = getPasswordStrength("Password123!");
      expect(result.strength).toBe("strong");
      expect(result.score).toBeGreaterThan(4);
    });

    it("should increase score for length >= 8", () => {
      const short = getPasswordStrength("Pass1");
      const long = getPasswordStrength("Password1");
      expect(long.score).toBeGreaterThan(short.score);
    });

    it("should increase score for length >= 12", () => {
      const medium = getPasswordStrength("Password1");
      const longer = getPasswordStrength("LongPassword1");
      expect(longer.score).toBeGreaterThan(medium.score);
    });

    it("should increase score for uppercase letters", () => {
      const noUpper = getPasswordStrength("password123");
      const withUpper = getPasswordStrength("Password123");
      expect(withUpper.score).toBeGreaterThan(noUpper.score);
    });

    it("should increase score for lowercase letters", () => {
      const noLower = getPasswordStrength("PASSWORD123");
      const withLower = getPasswordStrength("Password123");
      expect(withLower.score).toBeGreaterThan(noLower.score);
    });

    it("should increase score for numbers", () => {
      const noNumber = getPasswordStrength("Password");
      const withNumber = getPasswordStrength("Password123");
      expect(withNumber.score).toBeGreaterThan(noNumber.score);
    });

    it("should increase score for special characters", () => {
      const noSpecial = getPasswordStrength("Password123");
      const withSpecial = getPasswordStrength("Password123!");
      expect(withSpecial.score).toBeGreaterThan(noSpecial.score);
    });

    it("should handle empty password", () => {
      const result = getPasswordStrength("");
      expect(result.strength).toBe("weak");
      expect(result.score).toBe(0);
    });

    it("should detect various special characters", () => {
      const specialChars = '!@#$%^&*(),.?":{}|<>';
      specialChars.split("").forEach((char) => {
        const result = getPasswordStrength(`Password123${char}`);
        expect(result.score).toBeGreaterThanOrEqual(5);
      });
    });
  });
});

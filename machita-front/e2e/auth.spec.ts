import { test, expect } from "@playwright/test";

test.describe("Authentication E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display landing page", async ({ page }) => {
    await expect(page).toHaveTitle(/Machtia/i);

    // Check for key elements on landing page
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should open login modal when clicking login button", async ({ page }) => {
    // Look for a button that opens auth modal (adjust selector as needed)
    const loginButton = page.getByRole("button", { name: /iniciar sesión|login/i });
    await loginButton.click();

    // Verify modal is open by checking for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test("should complete full login flow", async ({ page, context }) => {
    // Open login modal
    const loginButton = page.getByRole("button", { name: /iniciar sesión|login/i });
    await loginButton.click();

    // Fill in login form
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/contraseña|password/i).fill("password123");

    // Submit form
    const submitButton = page.getByRole("button", { name: /entrar|login/i });
    await submitButton.click();

    // Wait for redirect to authenticated page
    await page.waitForURL("/aprende", { timeout: 5000 });

    // Verify we're on the authenticated page
    await expect(page).toHaveURL("/aprende");

    // Check for authenticated UI elements
    const userAvatar = page.getByRole("button", { name: /perfil|profile/i });
    await expect(userAvatar).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Open login modal
    const loginButton = page.getByRole("button", { name: /iniciar sesión|login/i });
    await loginButton.click();

    // Fill in with wrong credentials
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/contraseña|password/i).fill("wrongpassword");

    // Submit form
    const submitButton = page.getByRole("button", { name: /entrar|login/i });
    await submitButton.click();

    // Check for error message
    const errorMessage = page.getByText(/credenciales|invalid|error/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should switch between login and register tabs", async ({ page }) => {
    // Open auth modal
    const loginButton = page.getByRole("button", { name: /iniciar sesión|login/i });
    await loginButton.click();

    // Should start on login tab
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Switch to register tab
    const registerTab = page.getByRole("tab", { name: /registrarse|register/i });
    await registerTab.click();

    // Check for register-specific fields (nombre field)
    const nombreInput = page.getByLabel(/nombre/i);
    await expect(nombreInput).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    // Open login modal
    const loginButton = page.getByRole("button", { name: /iniciar sesión|login/i });
    await loginButton.click();

    // Try invalid email
    await page.getByLabel(/email/i).fill("invalid-email");
    await page.getByLabel(/contraseña|password/i).fill("password123");

    // Try to submit
    const submitButton = page.getByRole("button", { name: /entrar|login/i });
    await submitButton.click();

    // Should show validation error
    const validationError = page.getByText(/email.*válido|invalid email/i);
    await expect(validationError).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/");
    const loginButton = page.getByRole("button", { name: /iniciar sesión|login/i });
    await loginButton.click();

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/contraseña|password/i).fill("password123");

    const submitButton = page.getByRole("button", { name: /entrar|login/i });
    await submitButton.click();

    await page.waitForURL("/aprende");

    // Now logout
    const userMenu = page.getByRole("button", { name: /perfil|profile/i });
    await userMenu.click();

    const logoutButton = page.getByRole("menuitem", {
      name: /cerrar sesión|logout/i,
    });
    await logoutButton.click();

    // Should redirect to home
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });
});

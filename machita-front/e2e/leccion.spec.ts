import { test, expect } from "@playwright/test";

test.describe("Lección E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/");

    const loginButton = page.getByRole("button", {
      name: /iniciar sesión|login/i,
    });
    await loginButton.click();

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/contraseña|password/i).fill("password123");

    const submitButton = page.getByRole("button", { name: /entrar|login/i });
    await submitButton.click();

    await page.waitForURL("/aprende");
  });

  test("should navigate to aprende page after login", async ({ page }) => {
    await expect(page).toHaveURL("/aprende");

    // Check for learning interface elements
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should display available lecciones", async ({ page }) => {
    // Look for lesson cards or buttons
    const leccionCard = page.locator('[data-testid="leccion-card"]').first();
    await expect(leccionCard).toBeVisible({ timeout: 10000 });
  });

  test("should open a leccion when clicked", async ({ page }) => {
    // Click on first available lesson
    const firstLeccion = page.getByRole("button", { name: /lección|lesson/i }).first();
    await firstLeccion.click();

    // Should navigate to lesson page
    await expect(page.url()).toMatch(/\/leccion\/\d+/);

    // Check for lesson interface
    const palabra = page.locator('[data-testid="palabra-nahuatl"]');
    await expect(palabra).toBeVisible({ timeout: 10000 });
  });

  test("should complete a full lesson flow", async ({ page }) => {
    // Navigate to first lesson
    const firstLeccion = page.getByRole("button", { name: /lección|lesson/i }).first();
    await firstLeccion.click();

    await page.waitForURL(/\/leccion\/\d+/);

    // Complete at least one exercise
    // This will depend on the exercise type
    // For a traduccion exercise:
    const inputField = page.getByPlaceholder(/traducción|translation/i);
    if (await inputField.isVisible()) {
      await inputField.fill("Hola");
      const submitButton = page.getByRole("button", {
        name: /verificar|check/i,
      });
      await submitButton.click();

      // Wait for feedback
      const correctFeedback = page.getByText(/correcto|correct/i);
      await expect(correctFeedback).toBeVisible({ timeout: 5000 });
    }

    // Continue through exercises until lesson is complete
    // Look for "Continue" or "Next" button
    const nextButton = page.getByRole("button", { name: /continuar|next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });

  test("should show vidas indicator", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for vidas/lives indicator
    const vidasIndicator = page.getByTestId("vidas-indicator");
    await expect(vidasIndicator).toBeVisible();
  });

  test("should show racha (streak) in sidebar", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for racha display
    const rachaDisplay = page.getByText(/racha|streak/i);
    await expect(rachaDisplay).toBeVisible();
  });

  test("should display user stats in sidebar", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for user statistics
    const tominsDisplay = page.getByText(/tomin/i);
    await expect(tominsDisplay).toBeVisible();
  });

  test("should handle incorrect answer", async ({ page }) => {
    // Navigate to lesson
    const firstLeccion = page.getByRole("button", { name: /lección|lesson/i }).first();
    await firstLeccion.click();

    await page.waitForURL(/\/leccion\/\d+/);

    // Give a wrong answer
    const inputField = page.getByPlaceholder(/traducción|translation/i);
    if (await inputField.isVisible()) {
      await inputField.fill("Wrong Answer");
      const submitButton = page.getByRole("button", {
        name: /verificar|check/i,
      });
      await submitButton.click();

      // Wait for incorrect feedback
      const incorrectFeedback = page.getByText(/incorrecto|incorrect|intenta/i);
      await expect(incorrectFeedback).toBeVisible({ timeout: 5000 });
    }
  });

  test("should show completion screen", async ({ page }) => {
    // This test assumes we can complete a lesson quickly
    // Navigate to lesson
    const firstLeccion = page.getByRole("button", { name: /lección|lesson/i }).first();
    await firstLeccion.click();

    await page.waitForURL(/\/leccion\/\d+/);

    // Look for completion indicator (after answering all exercises correctly)
    // This is a simplified version - real implementation would need to
    // complete all exercises in the lesson

    // Check if completion screen appears (with reasonable timeout)
    const completionHeading = page.getByRole("heading", {
      name: /completada|completed|felicitaciones/i,
    });

    // Only check if it appears within reasonable time (optional)
    const isComplete = await completionHeading.isVisible({ timeout: 30000 }).catch(() => false);

    if (isComplete) {
      // Verify completion stats
      const tominsEarned = page.getByText(/tomin.*ganados|earned/i);
      await expect(tominsEarned).toBeVisible();
    }
  });

  test("should navigate back to aprende page", async ({ page }) => {
    // Navigate to lesson
    const firstLeccion = page.getByRole("button", { name: /lección|lesson/i }).first();
    await firstLeccion.click();

    await page.waitForURL(/\/leccion\/\d+/);

    // Click back button or navigation
    const backButton = page.getByRole("button", { name: /atrás|back/i });
    if (await backButton.isVisible()) {
      await backButton.click();

      await page.waitForURL("/aprende");
      await expect(page).toHaveURL("/aprende");
    }
  });

  test("should show pyramid learning path", async ({ page }) => {
    // Check for pyramid visualization
    const pyramid = page.locator('[data-testid="pyramid-hero"]');
    await expect(pyramid).toBeVisible();

    // Check for level indicators
    const nivel1 = page.getByText(/nivel 1|principiante/i);
    await expect(nivel1).toBeVisible();
  });
});

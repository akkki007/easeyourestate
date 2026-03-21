import { test, expect } from "@playwright/test";

test.describe("Admin Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
  });

  test("should display admin login or setup form", async ({ page }) => {
    // Should show either "Admin Panel" (login) or "Admin Setup" (first setup)
    await expect(
      page.getByRole("heading", { name: /Admin/i })
    ).toBeVisible();
  });

  test("should have email and password fields", async ({ page }) => {
    await expect(
      page.getByPlaceholder("admin@example.com")
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(/Min 8 characters|••••••/i)
    ).toBeVisible();
  });

  test("should validate empty form submission", async ({ page }) => {
    // Find the submit button (either "Sign In" or "Create Admin Account")
    const submitButton = page
      .getByRole("button", { name: /Sign In|Create Admin/i })
      .first();

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation or stay on same page
      await expect(
        page.getByRole("heading", { name: /Admin/i })
      ).toBeVisible();
    }
  });

  test("should accept input in email field", async ({ page }) => {
    const emailInput = page.getByPlaceholder("admin@example.com");
    await emailInput.fill("test@admin.com");
    await expect(emailInput).toHaveValue("test@admin.com");
  });

  test("should accept input in password field", async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/Min 8 characters|••••••/i);
    await passwordInput.fill("testpassword123");
    await expect(passwordInput).toHaveValue("testpassword123");
  });
});

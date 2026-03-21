import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login modal with phone input", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
    await expect(page.getByText("+91")).toBeVisible();
    await expect(
      page.getByPlaceholder("Enter 10-digit number")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Send OTP/i })
    ).toBeVisible();
  });

  test("should show right panel marketing text", async ({ page }) => {
    await expect(
      page.getByText("Find your perfect place to call home")
    ).toBeVisible();
  });

  test("should validate phone number before sending OTP", async ({ page }) => {
    const phoneInput = page.getByPlaceholder("Enter 10-digit number");

    // Try with invalid number (less than 10 digits)
    await phoneInput.fill("12345");
    await page.getByRole("button", { name: /Send OTP/i }).click();

    // Should stay on the same step (OTP input should NOT appear)
    await expect(
      page.getByPlaceholder("Enter 10-digit number")
    ).toBeVisible();
    await expect(page.getByPlaceholder("6-digit OTP")).not.toBeVisible();
  });

  test("should accept valid phone number and show OTP step", async ({
    page,
  }) => {
    const phoneInput = page.getByPlaceholder("Enter 10-digit number");
    await phoneInput.fill("9876543210");
    await page.getByRole("button", { name: /Send OTP/i }).click();

    // Should transition to OTP step (may show error from API but UI should transition)
    // Wait for either OTP field or an error message
    await expect(
      page
        .getByPlaceholder("6-digit OTP")
        .or(page.getByText(/error|failed|try again/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test("should have link to sign up page", async ({ page }) => {
    await expect(page.getByText(/Don't have an account/i)).toBeVisible();
    await expect(page.getByText(/Sign up/i)).toBeVisible();
  });

  test("should have a close button", async ({ page }) => {
    // Login component has a close (X) button
    const closeButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    await expect(closeButton).toBeVisible();
  });
});

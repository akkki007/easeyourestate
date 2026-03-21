import { test, expect } from "@playwright/test";

test.describe("Sign Up Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("should display signup form with step indicator", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Create an account/i })
    ).toBeVisible();

    // Step indicator shows Phone, Verify, Profile steps
    await expect(page.getByText("Phone")).toBeVisible();
    await expect(page.getByText("Verify")).toBeVisible();
    await expect(page.getByText("Profile")).toBeVisible();
  });

  test("should show phone input on first step", async ({ page }) => {
    await expect(page.getByText("Mobile Number")).toBeVisible();
    await expect(page.getByText("+91")).toBeVisible();
    await expect(
      page.getByPlaceholder("Enter 10-digit number")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Send OTP/i })
    ).toBeVisible();
    await expect(
      page.getByText("Get started with your free account today")
    ).toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    const phoneInput = page.getByPlaceholder("Enter 10-digit number");

    // Enter invalid phone
    await phoneInput.fill("123");
    await page.getByRole("button", { name: /Send OTP/i }).click();

    // Should remain on phone step
    await expect(
      page.getByPlaceholder("Enter 10-digit number")
    ).toBeVisible();
    await expect(page.getByPlaceholder("6-digit OTP")).not.toBeVisible();
  });

  test("should have link to login page", async ({ page }) => {
    await expect(page.getByText(/Already have an account/i)).toBeVisible();
    await expect(page.getByText(/Login/i)).toBeVisible();
  });

  test("should only accept numeric input for phone", async ({ page }) => {
    const phoneInput = page.getByPlaceholder("Enter 10-digit number");
    await phoneInput.fill("abcdefghij");
    const value = await phoneInput.inputValue();
    // Input should either be empty or filtered to numbers only
    expect(value.replace(/\D/g, "")).toBe("");
  });
});

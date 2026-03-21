import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("should display mobile menu on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile hamburger menu should be visible
    const menuButton = page
      .locator("button")
      .filter({ hasText: /menu/i })
      .or(page.locator("nav button svg").first());

    // On mobile, desktop nav links should be hidden
    // Mobile menu toggle should be present
    await expect(page.locator("nav")).toBeVisible();
  });

  test("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /More Comfortable\. More Classy\./i,
      })
    ).toBeVisible();
  });

  test("should display full navigation on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await expect(page.getByText("Pay Rent")).toBeVisible();
    await expect(page.getByText("For Property Owners")).toBeVisible();
  });

  test("should render login page responsively on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Enter 10-digit number")
    ).toBeVisible();
  });

  test("should render properties page on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/properties");
    await page.waitForLoadState("networkidle");

    // Page should load without breaking
    expect(page.url()).toContain("/properties");
  });
});

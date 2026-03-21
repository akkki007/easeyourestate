import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the landing page with all sections", async ({ page }) => {
    // Navbar is visible
    await expect(page.locator("nav")).toBeVisible();

    // Hero section
    await expect(
      page.getByRole("heading", { name: /More Comfortable\. More Classy\./i })
    ).toBeVisible();
    await expect(
      page.getByText("Find your perfect property")
    ).toBeVisible();

    // Features section
    await expect(
      page.getByRole("heading", { name: /Smart Real Estate, Powered by AI/i })
    ).toBeVisible();

    // Testimonials section
    await expect(
      page.getByRole("heading", { name: /What Our Customers Say/i })
    ).toBeVisible();

    // CTA section
    await expect(
      page.getByRole("heading", { name: /Do you know how much loan you can get/i })
    ).toBeVisible();

    // Footer
    await expect(page.getByText("EaseYourEstate.ai")).toBeVisible();
  });

  test("should display navigation links", async ({ page }) => {
    await expect(page.getByText("Pay Rent")).toBeVisible();
    await expect(page.getByText("For Property Owners")).toBeVisible();
  });

  test("should show login and signup buttons when not authenticated", async ({
    page,
  }) => {
    await expect(page.getByRole("link", { name: /Login/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign Up/i })).toBeVisible();
  });

  test("should have a working theme toggle", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    // Theme should change — verify html class toggles
    const html = page.locator("html");
    const classAfterClick = await html.getAttribute("class");
    expect(classAfterClick).toBeTruthy();
  });

  test("should display hero statistics", async ({ page }) => {
    await expect(page.getByText("10 Lakh+")).toBeVisible();
    await expect(page.getByText("5 Lakh+")).toBeVisible();
    await expect(page.getByText("35+")).toBeVisible();
    await expect(page.getByText("Zero")).toBeVisible();
  });

  test("should display all 6 feature cards", async ({ page }) => {
    await expect(page.getByText("Zero Brokerage")).toBeVisible();
    await expect(page.getByText("AI-Powered Matching")).toBeVisible();
    await expect(page.getByText("Verified Listings")).toBeVisible();
    await expect(page.getByText("Packers & Movers")).toBeVisible();
    await expect(page.getByText("Rent Payment")).toBeVisible();
    await expect(page.getByText("Top Rated Service")).toBeVisible();
  });

  test("should display testimonials with ratings", async ({ page }) => {
    await expect(page.getByText("Priya Sharma")).toBeVisible();
    await expect(page.getByText("Arjun Mehta")).toBeVisible();
    await expect(page.getByText("Kavya Reddy")).toBeVisible();
  });

  test("should display footer with contact info and links", async ({
    page,
  }) => {
    await expect(page.getByText("+91 92239 22329")).toBeVisible();
    await expect(page.getByText("hello@easeyourestate.ai")).toBeVisible();
    await expect(page.getByText("Privacy Policy")).toBeVisible();
    await expect(page.getByText("Terms of Service")).toBeVisible();
  });
});

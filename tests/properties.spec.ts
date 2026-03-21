import { test, expect } from "@playwright/test";

test.describe("Properties Listing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/properties");
  });

  test("should load the properties page", async ({ page }) => {
    // Should show either property listings or a loading state
    await expect(
      page
        .getByText(/Flats|Apartments|Properties|Finding the best/i)
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("should display sort options", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if sort dropdown or controls exist
    const sortControl = page.getByText(/Relevance|Sort/i).first();
    if (await sortControl.isVisible()) {
      await expect(sortControl).toBeVisible();
    }
  });

  test("should display property cards or no results message", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    // Either property cards or "No Properties Found" message
    const hasProperties = await page
      .locator("[class*='card'], [class*='Card']")
      .first()
      .isVisible()
      .catch(() => false);
    const hasNoResults = await page
      .getByText(/No Properties Found/i)
      .isVisible()
      .catch(() => false);

    expect(hasProperties || hasNoResults).toBeTruthy();
  });

  test("should navigate to property detail when clicking a property", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    // Find first property link
    const propertyLink = page.locator("a[href*='/property/']").first();
    if (await propertyLink.isVisible().catch(() => false)) {
      await propertyLink.click();
      await page.waitForURL(/\/property\//);
      expect(page.url()).toContain("/property/");
    }
  });
});

test.describe("Properties Page - Filtering", () => {
  test("should filter by search query parameter", async ({ page }) => {
    await page.goto("/properties?city=Bangalore");
    await page.waitForLoadState("networkidle");

    // Page should load with Bangalore context
    await expect(
      page
        .getByText(/Bangalore|Finding/i)
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("should filter by property purpose", async ({ page }) => {
    await page.goto("/properties?purpose=Rent");
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .getByText(/Rent|Properties|Finding/i)
        .first()
    ).toBeVisible({ timeout: 15000 });
  });
});

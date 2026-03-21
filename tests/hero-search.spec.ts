import { test, expect } from "@playwright/test";

test.describe("Hero Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display search form with default city", async ({ page }) => {
    await expect(page.getByText("Bangalore")).toBeVisible();
    await expect(
      page.getByPlaceholder("Search upto 3 localities or landmarks")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("should show BHK filter options", async ({ page }) => {
    const bhkDropdown = page.getByText("Any BHK");
    await expect(bhkDropdown).toBeVisible();
    await bhkDropdown.click();

    await expect(page.getByText("1 BHK")).toBeVisible();
    await expect(page.getByText("2 BHK")).toBeVisible();
    await expect(page.getByText("3 BHK")).toBeVisible();
    await expect(page.getByText("4 BHK")).toBeVisible();
  });

  test("should show property type filters", async ({ page }) => {
    await expect(page.getByText("Full House")).toBeVisible();
    await expect(page.getByText("PG/Hostel")).toBeVisible();
    await expect(page.getByText("Flatmates")).toBeVisible();
  });

  test("should allow typing in the search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      "Search upto 3 localities or landmarks"
    );
    await searchInput.fill("Koramangala");
    await expect(searchInput).toHaveValue("Koramangala");
  });

  test("should show Post Free Property Ad CTA", async ({ page }) => {
    await expect(page.getByText("Post Free Property Ad")).toBeVisible();
    await expect(page.getByText("Are you a Property Owner?")).toBeVisible();
  });

  test("should navigate to search results on search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      "Search upto 3 localities or landmarks"
    );
    await searchInput.fill("Koramangala");
    await page.getByRole("button", { name: "Search" }).click();

    // Should navigate to /search or /properties with query params
    await page.waitForURL(/\/(search|properties)/);
    expect(page.url()).toMatch(/\/(search|properties)/);
  });
});

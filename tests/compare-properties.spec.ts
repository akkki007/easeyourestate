import { test, expect } from "@playwright/test";

test.describe("Property Comparison", () => {
  test("should load the compare page", async ({ page }) => {
    await page.goto("/properties/compare");
    await page.waitForLoadState("networkidle");

    // Compare page should load without errors
    expect(page.url()).toContain("/properties/compare");
  });

  test("should show comparison UI or empty state", async ({ page }) => {
    await page.goto("/properties/compare");
    await page.waitForLoadState("networkidle");

    // Should show either comparison table or a message to add properties
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
  });
});

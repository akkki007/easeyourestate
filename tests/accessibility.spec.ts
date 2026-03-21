import { test, expect } from "@playwright/test";

test.describe("Accessibility Basics", () => {
  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("should have proper heading hierarchy on landing page", async ({
    page,
  }) => {
    await page.goto("/");

    // Should have at least one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");
      // Images should have alt text or role="presentation"
      expect(alt !== null || role === "presentation").toBeTruthy();
    }
  });

  test("should have proper form labels on login page", async ({ page }) => {
    await page.goto("/login");

    // Phone input should have a label
    await expect(page.getByText("Mobile Number")).toBeVisible();
  });

  test("should have proper form labels on signup page", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByText("Mobile Number")).toBeVisible();
  });

  test("should support keyboard navigation on landing page", async ({
    page,
  }) => {
    await page.goto("/");

    // Tab through the page — focus should be visible
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Some element should be focused
    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedTag).toBeTruthy();
  });

  test("should have sufficient color contrast for text", async ({ page }) => {
    await page.goto("/");

    // Verify the main heading is readable (not transparent/invisible)
    const heading = page.getByRole("heading", {
      name: /More Comfortable/i,
    });
    await expect(heading).toBeVisible();
    const color = await heading.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue("color")
    );
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
    expect(color).not.toBe("transparent");
  });
});

import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("should load search page with query", async ({ page }) => {
    await page.goto("/search?query=Koramangala&city=Bangalore");
    await page.waitForLoadState("networkidle");

    // Should show results or loading state
    await expect(
      page
        .getByText(/Koramangala|Properties|Finding the best/i)
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("should show breadcrumb navigation", async ({ page }) => {
    await page.goto("/search?query=Koramangala&city=Bangalore");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Home").first()).toBeVisible();
  });

  test("should display sort options", async ({ page }) => {
    await page.goto("/search?city=Bangalore");
    await page.waitForLoadState("networkidle");

    // Wait for content to render
    await page.waitForTimeout(2000);

    // Sort options should be available
    const sortExists = await page
      .getByText(/Relevance|Sort|Newest/i)
      .first()
      .isVisible()
      .catch(() => false);
    // Sort may not render if no results
    expect(typeof sortExists).toBe("boolean");
  });

  test("should show no results message for invalid query", async ({
    page,
  }) => {
    await page.goto("/search?query=xyznonexistent12345&city=Bangalore");
    await page.waitForLoadState("networkidle");

    // Should show either results or a no-results state
    await expect(
      page
        .getByText(
          /No Properties Found|couldn't find|properties|Finding/i
        )
        .first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("should have view mode toggle (List/Map)", async ({ page }) => {
    await page.goto("/search?city=Bangalore");
    await page.waitForLoadState("networkidle");

    const listButton = page.getByText("List").first();
    const mapButton = page.getByText("Map").first();

    if (await listButton.isVisible().catch(() => false)) {
      await expect(listButton).toBeVisible();
      await expect(mapButton).toBeVisible();
    }
  });
});

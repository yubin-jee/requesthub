import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Critical Request Banner", () => {
  test("should show warning banner for admin when critical submitted requests exist", async ({ page }) => {
    await login(page);
    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("critical request(s) awaiting review");
    await expect(banner).toContainText("1");
  });

  test("should NOT show banner for reviewer", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");
    const banner = page.getByTestId("critical-banner");
    await expect(banner).not.toBeVisible();
  });

  test("should NOT show banner for requester", async ({ page }) => {
    await login(page, "requester@requesthub.dev", "requester123");
    const banner = page.getByTestId("critical-banner");
    await expect(banner).not.toBeVisible();
  });
});

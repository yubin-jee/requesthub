import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Critical Request Banner", () => {
  test("should show critical banner for admin user", async ({ page }) => {
    await login(page, "admin@requesthub.dev", "admin123");
    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("critical request(s) awaiting review");
  });

  test("should not show critical banner for requester user", async ({ page }) => {
    await login(page, "requester@requesthub.dev", "requester123");
    const banner = page.getByTestId("critical-banner");
    await expect(banner).not.toBeVisible();
  });

  test("should not show critical banner for reviewer user", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");
    const banner = page.getByTestId("critical-banner");
    await expect(banner).not.toBeVisible();
  });
});

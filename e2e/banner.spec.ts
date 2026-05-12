import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Critical Requests Banner", () => {
  test("should show banner for admin when critical submitted requests exist", async ({
    page,
  }) => {
    await login(page, "admin@requesthub.dev", "admin123");

    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("critical request(s) awaiting review");
    await expect(banner).toContainText("1");
  });

  test("should not show banner for requester", async ({ page }) => {
    await login(page, "requester@requesthub.dev", "requester123");

    await expect(page.getByTestId("critical-banner")).not.toBeVisible();
  });

  test("should not show banner for reviewer", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");

    await expect(page.getByTestId("critical-banner")).not.toBeVisible();
  });
});

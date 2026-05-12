import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Critical Requests Banner", () => {
  test("should display critical banner for admin user", async ({ page }) => {
    await login(page);
    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("critical request(s) awaiting review");
  });

  test("should not display critical banner for requester", async ({ page }) => {
    await login(page, "requester@requesthub.dev", "requester123");
    await expect(page.getByTestId("critical-banner")).not.toBeVisible();
  });

  test("should not display critical banner for reviewer", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");
    await expect(page.getByTestId("critical-banner")).not.toBeVisible();
  });
});

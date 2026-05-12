import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Critical Requests Banner", () => {
  test("should display banner for admin when critical submitted requests exist", async ({
    page,
  }) => {
    await login(page);

    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("critical request(s) awaiting review");
    await expect(banner).toContainText("1");
  });

  test("should not display banner for non-admin users", async ({ page }) => {
    await login(page, "requester@requesthub.dev", "requester123");

    await expect(page.getByTestId("critical-banner")).not.toBeVisible();
  });

  test("should not display banner for reviewer role", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");

    await expect(page.getByTestId("critical-banner")).not.toBeVisible();
  });
});

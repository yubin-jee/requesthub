import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should display list of feature requests", async ({ page }) => {
    await expect(page.getByText("Add dark mode support")).toBeVisible();
    await expect(page.getByText("Implement SSO with Okta")).toBeVisible();
  });

  test("should filter requests by status", async ({ page }) => {
    await page.locator("#status-filter").selectOption("SUBMITTED");
    await expect(page.getByText("Add dark mode support")).toBeVisible();
    await expect(page.getByText("Implement SSO with Okta")).not.toBeVisible();
  });

  test("should filter requests by priority", async ({ page }) => {
    await page.locator("#priority-filter").selectOption("CRITICAL");
    await expect(page.getByText("Implement SSO with Okta")).toBeVisible();
    await expect(page.getByText("Add dark mode support")).not.toBeVisible();
  });

  test("should navigate to request detail on click", async ({ page }) => {
    await page.getByText("Add dark mode support").click();
    await expect(page.getByText("Requested by:")).toBeVisible();
    await expect(page.getByText("Sam Rivera")).toBeVisible();
  });
});

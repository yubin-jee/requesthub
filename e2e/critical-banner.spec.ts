import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Critical Requests Banner", () => {
  test("should display critical banner when critical submitted requests exist", async ({
    page,
  }) => {
    await login(page);

    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("critical request");
    await expect(banner).toContainText("awaiting review");
  });

  test("should show correct count of critical submitted requests", async ({
    page,
  }) => {
    await login(page);

    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();
    // Seed data has 1 CRITICAL+SUBMITTED request ("Emergency security vulnerability patch")
    await expect(banner).toContainText("1");
  });

  test("should hide banner after critical request is moved out of submitted status", async ({
    page,
  }) => {
    await login(page);

    // Verify banner is visible initially
    const banner = page.getByTestId("critical-banner");
    await expect(banner).toBeVisible();

    // Filter to SUBMITTED to find the critical request
    await page.locator("#status-filter").selectOption("SUBMITTED");
    await page
      .getByRole("link", { name: "Emergency security vulnerability patch" })
      .click();

    // Transition it to Under Review
    await page.getByRole("button", { name: "Start Review" }).click();
    await expect(page.getByText("Under Review")).toBeVisible();

    // Navigate back to dashboard
    await page.getByText("Back to dashboard").click();
    await page.getByText("Feature Requests").waitFor();

    // Banner should no longer be visible
    await expect(banner).not.toBeVisible();
  });
});

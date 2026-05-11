import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Request Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should create a new feature request", async ({ page }) => {
    await page.getByRole("link", { name: "+ New Request" }).click();
    await page.getByLabel("Title").fill("Automated test request");
    await page.getByLabel("Description").fill("This is a test request created by Playwright.");
    await page.locator("#priority").selectOption("HIGH");
    await page.locator("#category").selectOption("BACKEND");
    await page.getByRole("button", { name: "Submit Request" }).click();

    // Should navigate to the detail page
    await expect(page.getByText("Automated test request")).toBeVisible();
    await expect(page.getByText("Requested by:")).toBeVisible();
  });

  test("should submit a request with Data category", async ({ page }) => {
    await page.getByRole("link", { name: "+ New Request" }).click();
    await page.getByLabel("Title").fill("Data pipeline optimization");
    await page.getByLabel("Description").fill("Need to optimize the ETL pipeline for faster data processing.");
    await page.locator("#priority").selectOption("MEDIUM");

    // This should select "Data" category — but the option is missing from the dropdown!
    await page.locator("#category").selectOption("DATA");

    await page.getByRole("button", { name: "Submit Request" }).click();
    await expect(page.getByText("Data pipeline optimization")).toBeVisible();
  });

  test("should transition request from Submitted to Under Review", async ({
    page,
  }) => {
    // Find a submitted request
    await page.locator("#status-filter").selectOption("SUBMITTED");
    await page.getByRole("link", { name: "Add dark mode support" }).click();

    // Transition it
    await page.getByRole("button", { name: "Start Review" }).click();
    await expect(page.getByText("Under Review")).toBeVisible();
  });

  test("should add a comment to a request", async ({ page }) => {
    await page.getByRole("link", { name: "Add dark mode support" }).click();
    await page.getByPlaceholder("Add a comment").fill("Looks good, let's prioritize this.");
    await page.getByRole("button", { name: "Comment" }).click();
    await expect(
      page.getByText("Looks good, let's prioritize this."),
    ).toBeVisible();
  });
});

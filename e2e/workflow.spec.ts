import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Approval Workflow", () => {
  test("should complete full approval workflow as reviewer", async ({
    page,
  }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");

    // Filter to submitted requests
    await page.locator("#status-filter").selectOption("SUBMITTED");

    // Click on a submitted request
    await page.getByRole("link", { name: "Add rate limiting to API endpoints" }).click();

    // Wait for detail page to load
    await expect(page.getByText("Requested by:")).toBeVisible();

    // Start review
    await page.getByRole("button", { name: "Start Review" }).click();
    await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();

    // Approve
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByRole("button", { name: "Start Work" })).toBeVisible();

    // Start work
    await page.getByRole("button", { name: "Start Work" }).click();
    await expect(page.getByRole("button", { name: "Mark Done" })).toBeVisible();

    // Mark done
    await page.getByRole("button", { name: "Mark Done" }).click();

    // No more action buttons should be visible
    await expect(page.getByText("Actions:")).not.toBeVisible();
  });

  test("should reject a request", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");

    await page.locator("#status-filter").selectOption("SUBMITTED");
    await page.getByRole("link", { name: "Build data migration tool" }).click();

    // Wait for detail page
    await expect(page.getByText("Requested by:")).toBeVisible();

    // Start review
    await page.getByRole("button", { name: "Start Review" }).click();
    await expect(page.getByRole("button", { name: "Reject" })).toBeVisible();

    // Reject
    await page.getByRole("button", { name: "Reject" }).click();

    // No further actions should be available
    await expect(page.getByRole("button", { name: "Approve" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Reject" })).not.toBeVisible();
  });
});

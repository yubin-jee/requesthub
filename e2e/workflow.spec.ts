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
    await page.getByText("Add rate limiting to API endpoints").click();
    await expect(page.getByText("Submitted")).toBeVisible();

    // Start review
    await page.getByRole("button", { name: "Start Review" }).click();
    await expect(page.getByText("Under Review")).toBeVisible();

    // Approve
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Approved")).toBeVisible();

    // Start work
    await page.getByRole("button", { name: "Start Work" }).click();
    await expect(page.getByText("In Progress")).toBeVisible();

    // Mark done
    await page.getByRole("button", { name: "Mark Done" }).click();
    await expect(page.getByText("Done")).toBeVisible();
  });

  test("should reject a request", async ({ page }) => {
    await login(page, "reviewer@requesthub.dev", "reviewer123");

    await page.locator("#status-filter").selectOption("SUBMITTED");
    await page.getByText("Add dark mode support").click();

    // Start review
    await page.getByRole("button", { name: "Start Review" }).click();
    await expect(page.getByText("Under Review")).toBeVisible();

    // Reject
    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByText("Rejected")).toBeVisible();

    // No further actions should be available
    await expect(page.getByRole("button", { name: "Approve" })).not.toBeVisible();
  });
});

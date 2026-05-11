import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Authentication", () => {
  test("should display login page when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "RequestHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    await login(page);
    await expect(page.getByText("Feature Requests")).toBeVisible();
    await expect(page.getByText("Alex Chen", { exact: true }).first()).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Email").fill("bad@email.com");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("should logout", async ({ page }) => {
    await login(page);
    await page.getByText("Logout").click();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});

import { type Page } from "@playwright/test";

export async function login(
  page: Page,
  email = "admin@requesthub.dev",
  password = "admin123",
) {
  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
  await page.getByText("Feature Requests").waitFor();
}

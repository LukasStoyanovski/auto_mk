// file: tests/e2e.spec.ts
import { test, expect } from "@playwright/test";

test("root redirects to /mk and search API works", async ({ page, request, baseURL }) => {
  // root → /mk redirect
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/mk$/);

  // search API returns ok
  const res = await request.get(`${baseURL}/api/search`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty("ok", true);
  expect(json).toHaveProperty("items");
});

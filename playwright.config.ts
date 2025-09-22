// file: playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: true,
  },
  reporter: [["list"]],
  timeout: 30_000,
});

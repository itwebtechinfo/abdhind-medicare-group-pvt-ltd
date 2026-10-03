import { defineConfig } from "@playwright/test";

/**
 * Role × page matrix against a LOCAL frontend + LOCAL backend only.
 * Run: npm run test:e2e   (see tests/e2e/README.md)
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  // The whole matrix shares one backend and real sessions - keep it serial.
  workers: 1,
  fullyParallel: false,
  timeout: 30 * 60 * 1000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
});

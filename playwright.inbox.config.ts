import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * WhatsApp inbox E2E - LOCAL ONLY, and it never talks to Meta or a phone:
 *   - mock Meta Graph API on :8099 (tests/e2e/mock-meta.mjs) records every send
 *   - backend on :8020 with META_GRAPH_BASE_URL -> the mock, a local webhook
 *     secret, a fake token, and WHATSAPP_SEND_ALLOWLIST = QA patient + the
 *     fake E2E numbers (+9199900000NN)
 *   - frontend on :3100 (own build dir, so it runs beside your normal dev server)
 *
 * Run:  npm run test:e2e:inbox
 * Needs: local MongoDB + Redis, ffmpeg, the QA users (qa/test-users.local.md),
 *        and `npx playwright install chromium webkit`.
 */
const BE_DIR = process.env.E2E_BE_DIR ?? path.resolve(__dirname, "../abdhind-medicare-be");
const ALLOWLIST = ["+916394823532", ...Array.from({ length: 49 }, (_, i) => `+9199900000${String(i + 1).padStart(2, "0")}`)].join(",");

process.env.E2E_BASE_URL ??= "http://localhost:3100";
process.env.E2E_API_URL ??= "http://localhost:8020";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /inbox\.spec\.ts/,
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-inbox" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    viewport: { width: 1600, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 900 } } },
    // iPhone Safari engine: voice-note playback must work there too.
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1600, height: 900 } }, grep: /@webkit/ },
  ],
  webServer: [
    {
      command: "node tests/e2e/mock-meta.mjs",
      url: "http://127.0.0.1:8099/__control/calls",
      reuseExistingServer: true,
    },
    {
      command: "venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8020 --workers 4",
      cwd: BE_DIR,
      url: "http://127.0.0.1:8020/",
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        WHATSAPP_SEND_ALLOWLIST: ALLOWLIST,
        WHATSAPP_APP_SECRET: "e2e-local-secret",
        WHATSAPP_TOKEN: "e2e-fake-token",
        META_GRAPH_BASE_URL: "http://127.0.0.1:8099",
        BACKEND_URL: "http://localhost:8020",
        ALLOWED_ORIGINS: "http://localhost:3100",
        PYTHONUNBUFFERED: "1",
      },
    },
    {
      command: "npx next dev -p 3100",
      url: "http://localhost:3100/login",
      reuseExistingServer: true,
      timeout: 180_000,
      env: { NEXT_DIST_DIR: ".next-e2e", NEXT_PUBLIC_API_BASE_URL: "http://localhost:8020" },
    },
  ],
});

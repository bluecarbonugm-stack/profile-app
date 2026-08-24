import { defineConfig, devices } from "@playwright/test";

const PORT = 8123;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E runs the real application — real SSR, real hydration, real router. Nothing
 * is mocked at the component level.
 *
 * The one thing pinned is the external content source: `PROFILE_CONTENT_ENDPOINT`
 * is cleared so the profile renders its documented fallback content. Pointing the
 * suite at the live Google Sheet would make it depend on a third party whose cold
 * start we measured at 40s, and on spreadsheet rows that change without notice —
 * that is a flaky test, not a strong one. The live sheet is covered separately by
 * `live-sheet.spec.ts`, which is opt-in.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Force the deterministic fallback path. See note above.
      PROFILE_CONTENT_ENDPOINT: "",
      PORT: String(PORT),
    },
  },
});

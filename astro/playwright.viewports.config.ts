import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "viewport-scroll.spec.ts",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/viewport-results.json" }],
    ["html", { open: "never", outputFolder: "playwright-report-viewports" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    video: "on",
    trace: "on",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    ...devices["Desktop Chrome"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from "@playwright/test";

const baseUse = {
  baseURL: "http://127.0.0.1:4173",
  video: "on",
  trace: "on",
  screenshot: "only-on-failure",
  actionTimeout: 10_000,
};

export default defineConfig({
  testDir: "./tests",
  testMatch: "safari-compat.spec.ts",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/safari-results.json" }],
    ["html", { open: "never", outputFolder: "playwright-report-safari" }],
  ],
  projects: [
    {
      name: "chromium-iphone15",
      use: {
        ...baseUse,
        ...devices["iPhone 15"],
        browserName: "chromium",
      },
    },
    {
      name: "webkit-iphone15",
      use: {
        ...baseUse,
        ...devices["iPhone 15"],
        browserName: "webkit",
      },
    },
    {
      name: "webkit-ipad",
      use: {
        ...baseUse,
        ...devices["iPad Pro 11"],
        browserName: "webkit",
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

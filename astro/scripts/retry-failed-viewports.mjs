#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const overlayPath = path.join(dataDir, "viewport-results.overlay.json");
const basePath = path.join(dataDir, "viewport-results.base.json");

const OVERLAY_GREP = [
  "HD 1280×720.*trackpad inertia",
  "WSXGA\\+ 1600×900",
  "iPhone 15 Pro Max.*all main sections",
  "iPhone SE.*scroll down through entire site",
  "iPhone SE.*all main sections",
  "Samsung Galaxy S24.*round trip",
  "Google Pixel 8.*all main sections",
].join("|");

fs.mkdirSync(dataDir, { recursive: true });

// Save successful retry run (12 tests, all passed)
if (fs.existsSync(path.join(root, "test-results/viewport-results.json"))) {
  fs.copyFileSync(
    path.join(root, "test-results/viewport-results.json"),
    overlayPath,
  );
  console.log(`Overlay saved: ${overlayPath}`);
}

console.log("Running remaining tests (grep-invert)...");
const invertGrep = OVERLAY_GREP;
execSync(
  `npx playwright test -c playwright.viewports.config.ts --grep-invert "${invertGrep}"`,
  { cwd: root, stdio: "inherit" },
);

fs.copyFileSync(
  path.join(root, "test-results/viewport-results.json"),
  basePath,
);
console.log(`Base saved: ${basePath}`);

execSync("node scripts/merge-viewport-results.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/generate-viewport-report.mjs", { cwd: root, stdio: "inherit" });

console.log("Done.");

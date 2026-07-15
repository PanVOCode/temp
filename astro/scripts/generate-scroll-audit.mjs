#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsPath = path.join(root, "test-results/results.json");
const outPath = path.join(root, "fullscreen-scroll-audit.md");
const videoRoot = path.join(root, "test-results/fullscreen-scroll");

const slugByTitle = {
  "scroll down through entire site": "scroll-down-full-site",
  "scroll up through entire site": "scroll-up-full-site",
  "round trip through entire site": "round-trip-full-site",
  "full scroll down with large wheel deltas": "full-scroll-large-delta",
  "full scroll down with trackpad inertia bursts": "full-scroll-inertia",
  "full scroll respects boundaries at top and bottom": "full-scroll-boundaries",
};

if (!fs.existsSync(resultsPath)) {
  console.error("Missing test-results/results.json — run playwright test first.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

const lines = [
  "# Fullscreen Scroll Audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
];

let passed = 0;
let total = 0;

function walkSuites(suites, lines) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      const name = spec.title;
      const slug = slugByTitle[name] ?? name.replace(/\s+/g, "-").toLowerCase();
      for (const test of spec.tests ?? []) {
        total++;
        const result = test.results?.at(-1) ?? test.results?.[0];
        const ok =
          test.status === "expected" ||
          test.status === "flaky" ||
          result?.status === "passed";
        if (ok) passed++;

        const status = ok ? "✓" : "✗";
        const videoSrc = result?.attachments?.find((a) => a.name === "video")?.path;
        let video = "n/a";

        if (videoSrc && fs.existsSync(videoSrc)) {
          const destDir = path.join(videoRoot, slug);
          fs.mkdirSync(destDir, { recursive: true });
          const dest = path.join(destDir, "video.webm");
          fs.copyFileSync(videoSrc, dest);
          video = `./${path.relative(root, dest).replace(/\\/g, "/")}`;
        }

        const audit = result?.annotations?.find((a) => a.type === "audit");
        lines.push(`${status} ${name}`);
        if (audit?.description) lines.push(`  ${audit.description}`);
        lines.push(`  Status: ${result?.status ?? "unknown"}`);
        lines.push(`  Video: ${video}`);
        if (result?.error) {
          lines.push(`  Error: ${result.error.message?.split("\n")[0]}`);
        }
        lines.push("");
      }
    }
    walkSuites(suite.suites, lines);
  }
}

walkSuites(data.suites, lines);

lines.push("## Summary");
lines.push("");
lines.push(`Passed: ${passed}/${total}`);
lines.push("");
lines.push("Criterion: site scrolls through entirely from top to bottom.");

fs.writeFileSync(outPath, lines.join("\n"));
console.log(`Audit report written to ${outPath}`);

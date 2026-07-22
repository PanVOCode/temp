#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const basePath = path.join(dataDir, "viewport-results.base.json");
const overlayPath = path.join(dataDir, "viewport-results.overlay.json");
const outPath = path.join(dataDir, "viewport-results.json");

function getAnnotation(test, type) {
  const result = test.results?.[0];
  return result?.annotations?.find((a) => a.type === type)?.description ?? "";
}

function testKey(test, scenario) {
  const viewportId = getAnnotation(test, "viewport-id");
  return `${viewportId}::${scenario}`;
}

function collectTests(suites, map = new Map()) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      const scenario = spec.title;
      for (const test of spec.tests ?? []) {
        const key = testKey(test, scenario);
        if (viewportIdFromKey(key)) map.set(key, test);
      }
    }
    collectTests(suite.suites, map);
  }
  return map;
}

function viewportIdFromKey(key) {
  return key && !key.startsWith("::");
}

function deepMergeSuites(baseSuites, overlaySuites) {
  for (const os of overlaySuites ?? []) {
    let bs = (baseSuites ?? []).find((s) => s.title === os.title);
    if (!bs) {
      baseSuites.push(JSON.parse(JSON.stringify(os)));
      continue;
    }
    bs.specs = bs.specs ?? [];
    for (const ospec of os.specs ?? []) {
      let bspec = bs.specs.find((s) => s.title === ospec.title);
      if (!bspec) {
        bs.specs.push(JSON.parse(JSON.stringify(ospec)));
        continue;
      }
      bspec.tests = bspec.tests ?? [];
      for (const ot of ospec.tests ?? []) {
        const oid = getAnnotation(ot, "viewport-id");
        const idx = bspec.tests.findIndex(
          (t) => getAnnotation(t, "viewport-id") === oid,
        );
        if (idx === -1) bspec.tests.push(ot);
      }
    }
    bs.suites = bs.suites ?? [];
    deepMergeSuites(bs.suites, os.suites);
  }
}

function applyMergedTests(suites, map) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      const scenario = spec.title;
      spec.tests = (spec.tests ?? []).map((test) => {
        const key = testKey(test, scenario);
        return map.get(key) ?? test;
      });
    }
    applyMergedTests(suite.suites, map);
  }
}

if (!fs.existsSync(basePath) || !fs.existsSync(overlayPath)) {
  console.error("Missing base or overlay JSON in data/");
  process.exit(1);
}

const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
const overlay = JSON.parse(fs.readFileSync(overlayPath, "utf8"));

deepMergeSuites(base.suites, overlay.suites);

const merged = new Map(collectTests(base.suites));
for (const [key, test] of collectTests(overlay.suites)) {
  merged.set(key, test);
}

console.log(`Combined: ${merged.size} tests`);
applyMergedTests(base.suites, merged);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(base, null, 2));
console.log(`Merged results written to ${outPath}`);

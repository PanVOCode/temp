#!/usr/bin/env node
/**
 * Merge a Playwright JSON report into data/viewport-results.json
 * (adds/updates suites without dropping existing devices).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "data/viewport-results.json");
const incomingPath =
  process.argv[2] || path.join(root, "test-results/viewport-results.json");

function getAnnotation(test, type) {
  const result = test.results?.[0];
  return result?.annotations?.find((a) => a.type === type)?.description ?? "";
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
        if (idx === -1) bspec.tests.push(JSON.parse(JSON.stringify(ot)));
        else bspec.tests[idx] = JSON.parse(JSON.stringify(ot));
      }
    }
    bs.suites = bs.suites ?? [];
    deepMergeSuites(bs.suites, os.suites);
  }
}

if (!fs.existsSync(incomingPath)) {
  console.error(`Missing incoming results: ${incomingPath}`);
  process.exit(1);
}

const incoming = JSON.parse(fs.readFileSync(incomingPath, "utf8"));
let base = { suites: [] };
if (fs.existsSync(dataPath)) {
  base = JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

base.suites = base.suites ?? [];
deepMergeSuites(base.suites, incoming.suites ?? []);

fs.mkdirSync(path.dirname(dataPath), { recursive: true });
fs.writeFileSync(dataPath, JSON.stringify(base, null, 2));
console.log(`Merged ${incomingPath} → ${dataPath}`);

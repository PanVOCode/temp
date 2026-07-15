#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsPath = path.join(root, "test-results/viewport-results.json");
const reportDir = path.join(root, "viewport-scroll-report");
const outPath = path.join(reportDir, "index.html");
const legacyPath = path.join(root, "viewport-scroll-report.html");

const PLATFORM_LABELS = {
  macbook: "MacBook",
  windows: "Windows",
  phone: "Телефоны",
};

const SCENARIO_LABELS = {
  "scroll down through entire site": "Прокрутка вниз: весь сайт",
  "scroll up through entire site": "Прокрутка вверх: весь сайт",
  "round trip through entire site": "Туда-обратно: весь сайт",
  "full scroll down with large wheel deltas": "Весь сайт: большие deltaY",
  "full scroll down with trackpad inertia bursts": "Весь сайт: инерция тачпада",
  "full scroll respects boundaries at top and bottom": "Весь сайт: границы",
  "full scroll keeps hijack disabled": "Весь сайт: hijack отключён",
  "full scroll visits all main sections and cases":
    "Весь сайт: все секции и горизонтальные кейсы",
  "full scroll boundaries at top and bottom": "Весь сайт: границы (mobile)",
};

const SCENARIO_SLUG = {
  "scroll down through entire site": "scroll-down",
  "scroll up through entire site": "scroll-up",
  "round trip through entire site": "round-trip",
  "full scroll down with large wheel deltas": "large-delta",
  "full scroll down with trackpad inertia bursts": "inertia",
  "full scroll respects boundaries at top and bottom": "boundaries",
  "full scroll keeps hijack disabled": "hijack-off",
  "full scroll visits all main sections and cases": "all-sections-and-cases",
  "full scroll boundaries at top and bottom": "boundaries-mobile",
};

if (!fs.existsSync(resultsPath)) {
  console.error(
    "Missing test-results/viewport-results.json — run viewport tests first.",
  );
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

/** @type {Map<string, any>} */
const byViewport = new Map();

function getAnnotation(result, type) {
  return result?.annotations?.find((a) => a.type === type)?.description ?? "";
}

function copyAsset(absPath, relDest) {
  if (!absPath || !fs.existsSync(absPath)) return "";
  const dest = path.join(reportDir, relDest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(absPath, dest);
  return relDest;
}

function walkSuites(suites) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      const scenario = spec.title;
      const scenarioSlug =
        SCENARIO_SLUG[scenario] ?? scenario.replace(/\s+/g, "-");
      for (const test of spec.tests ?? []) {
        const result = test.results?.at(-1) ?? test.results?.[0];
        const metaResult = test.results?.[0] ?? result;
        const viewportId = getAnnotation(metaResult, "viewport-id");
        const platform = getAnnotation(metaResult, "platform");
        const viewportName = getAnnotation(metaResult, "viewport-name");
        const resolution = getAnnotation(metaResult, "resolution");
        const audit = getAnnotation(result, "audit");

        if (!viewportId) continue;

        if (!byViewport.has(viewportId)) {
          byViewport.set(viewportId, {
            id: viewportId,
            platform,
            name: viewportName,
            resolution,
            scenarios: [],
            passed: 0,
            failed: 0,
          });
        }

        const entry = byViewport.get(viewportId);
        const ok = test.status === "expected" || test.status === "flaky";
        if (ok) entry.passed++;
        else entry.failed++;

        const videoSrc = result?.attachments?.find(
          (a) => a.name === "video",
        )?.path;
        const traceSrc = result?.attachments?.find(
          (a) => a.name === "trace",
        )?.path;
        const screenshotSrc = result?.attachments?.find(
          (a) => a.name === "screenshot",
        )?.path;

        const base = `assets/${viewportId}/${scenarioSlug}`;
        const video = copyAsset(videoSrc, `${base}/video.webm`);
        const trace = copyAsset(traceSrc, `${base}/trace.zip`);
        const screenshot = copyAsset(screenshotSrc, `${base}/screenshot.png`);

        const rowStatus =
          test.status === "flaky" ? "flaky" : (result?.status ?? "unknown");
        entry.scenarios.push({
          scenario,
          label: SCENARIO_LABELS[scenario] ?? scenario,
          status: rowStatus,
          duration: result?.duration ?? 0,
          audit,
          error: result?.error?.message?.split("\n")[0] ?? "",
          video,
          trace,
          screenshot,
        });
      }
    }
    walkSuites(suite.suites);
  }
}

walkSuites(data.suites);

const platforms = ["macbook", "windows", "phone"];
const allEntries = [...byViewport.values()];
const totalPassed = allEntries.reduce((s, e) => s + e.passed, 0);
const totalFailed = allEntries.reduce((s, e) => s + e.failed, 0);
const totalTests = totalPassed + totalFailed;
const generatedAt = new Date().toISOString();

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPlatformSection(platform) {
  const devices = allEntries.filter((e) => e.platform === platform);
  if (!devices.length) return "";

  const platformPassed = devices.reduce((s, d) => s + d.passed, 0);
  const platformTotal = devices.reduce((s, d) => s + d.passed + d.failed, 0);

  const cards = devices
    .map((device) => {
      const rows = device.scenarios
        .map((s) => {
          const icon =
            s.status === "passed" || s.status === "flaky" ? "pass" : "fail";
          const detail = s.audit || s.error || `${Math.round(s.duration)}ms`;
          const links = [
            s.video
              ? `<a href="${esc(s.video)}" target="_blank" rel="noopener">video</a>`
              : "",
            s.trace ? `<a href="${esc(s.trace)}" download>trace</a>` : "",
            s.screenshot
              ? `<a href="${esc(s.screenshot)}" target="_blank" rel="noopener">screenshot</a>`
              : "",
          ]
            .filter(Boolean)
            .join(" · ");

          return `<tr class="${icon}">
            <td class="status"><span class="badge ${icon}">${icon === "pass" ? "✓" : "✗"}</span></td>
            <td class="scenario">${esc(s.label)}</td>
            <td class="detail">${esc(detail)}${s.status === "flaky" ? " <em>(retry)</em>" : ""}</td>
            <td class="links">${links || "—"}</td>
          </tr>`;
        })
        .join("");

      const allOk = device.failed === 0;
      return `<article class="device-card ${allOk ? "ok" : "bad"}">
        <header>
          <div>
            <h3>${esc(device.name)}</h3>
            <p class="meta">${esc(device.resolution)} · ${device.passed}/${device.passed + device.failed} passed</p>
          </div>
          <span class="device-badge ${allOk ? "pass" : "fail"}">${allOk ? "PASS" : "FAIL"}</span>
        </header>
        <table>
          <thead><tr><th></th><th>Сценарий</th><th>Результат</th><th>Артефакты</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </article>`;
    })
    .join("");

  return `<section class="platform" id="${platform}">
    <div class="platform-head">
      <h2>${PLATFORM_LABELS[platform]}</h2>
      <span class="platform-score">${platformPassed}/${platformTotal}</span>
    </div>
    <div class="device-grid">${cards}</div>
  </section>`;
}

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Viewport Scroll Report</title>
  <style>
    :root {
      --bg: #0b0d10;
      --panel: #12161c;
      --panel-2: #171c24;
      --text: #e8edf5;
      --muted: #8b97a8;
      --line: #243041;
      --pass: #3ecf8e;
      --fail: #ff6b6b;
      --accent: #5b8cff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font: 14px/1.5 "Segoe UI", system-ui, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, #1a2230 0%, var(--bg) 55%);
      color: var(--text);
    }
    .wrap { max-width: 1280px; margin: 0 auto; padding: 32px 20px 64px; }
    h1 { margin: 0 0 8px; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
    .subtitle { color: var(--muted); margin-bottom: 24px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 16px;
    }
    .stat .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
    .stat .value { font-size: 28px; font-weight: 700; margin-top: 4px; }
    .stat.pass .value { color: var(--pass); }
    .stat.fail .value { color: var(--fail); }
    .nav {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .nav a {
      color: var(--text); text-decoration: none; padding: 8px 14px;
      border: 1px solid var(--line); border-radius: 999px; background: var(--panel);
    }
    .nav a:hover { border-color: var(--accent); color: var(--accent); }
    .platform { margin-bottom: 36px; }
    .platform-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--line);
    }
    .platform-head h2 { margin: 0; font-size: 20px; }
    .platform-score {
      font-weight: 700; color: var(--muted); background: var(--panel);
      border: 1px solid var(--line); border-radius: 8px; padding: 4px 10px;
    }
    .device-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 14px;
    }
    .device-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
    }
    .device-card.ok { border-color: rgba(62, 207, 142, 0.35); }
    .device-card.bad { border-color: rgba(255, 107, 107, 0.45); }
    .device-card header {
      display: flex; justify-content: space-between; gap: 12px;
      padding: 14px 16px; background: var(--panel-2); border-bottom: 1px solid var(--line);
    }
    .device-card h3 { margin: 0; font-size: 15px; }
    .meta { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .device-badge {
      align-self: start; font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      padding: 4px 8px; border-radius: 6px;
    }
    .device-badge.pass { background: rgba(62,207,142,.15); color: var(--pass); }
    .device-badge.fail { background: rgba(255,107,107,.15); color: var(--fail); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
    th { text-align: left; color: var(--muted); font-weight: 600; }
    tr:last-child td { border-bottom: 0; }
    .status { width: 34px; }
    .badge {
      display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center;
      border-radius: 50%; font-size: 11px; font-weight: 700;
    }
    .badge.pass { background: rgba(62,207,142,.2); color: var(--pass); }
    .badge.fail { background: rgba(255,107,107,.2); color: var(--fail); }
    .detail { color: var(--muted); max-width: 220px; word-break: break-word; }
    .links a { color: var(--accent); text-decoration: none; }
    .links a:hover { text-decoration: underline; }
    .footer { margin-top: 32px; color: var(--muted); font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Viewport Scroll Report</h1>
    <p class="subtitle">Полноэкранная прокрутка · ${esc(generatedAt)}</p>

    <div class="summary">
      <div class="stat"><div class="label">Всего тестов</div><div class="value">${totalTests}</div></div>
      <div class="stat pass"><div class="label">Пройдено</div><div class="value">${totalPassed}</div></div>
      <div class="stat fail"><div class="label">Провалено</div><div class="value">${totalFailed}</div></div>
      <div class="stat"><div class="label">Устройств</div><div class="value">${allEntries.length}</div></div>
    </div>

    <nav class="nav">
      ${platforms.map((p) => `<a href="#${p}">${PLATFORM_LABELS[p]}</a>`).join("")}
    </nav>

    ${platforms.map(renderPlatformSection).join("")}

    <p class="footer">
      Критерий desktop: полная прокрутка сайта от первой до последней секции.<br />
      Mobile (≤900px): нативный скролл, hijack отключён — сайт листается целиком свайпами.<br />
      Открывать через <code>npm run report:viewports:open</code> — иначе видео не откроются из file://
    </p>
  </div>
</body>
</html>`;

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(outPath, html);

// Legacy redirect for file:///.../viewport-scroll-report.html bookmarks
fs.writeFileSync(
  legacyPath,
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=http://127.0.0.1:5199/"><title>Redirect</title></head><body><p>Откройте <a href="http://127.0.0.1:5199/">http://127.0.0.1:5199/</a> или запустите <code>npm run report:viewports:open</code></p></body></html>`,
);

console.log(`HTML report written to ${outPath}`);
console.log(`Passed: ${totalPassed}/${totalTests}`);
console.log(`Videos copied to ${path.join(reportDir, "assets")}`);

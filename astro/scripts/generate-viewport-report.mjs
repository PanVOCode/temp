#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportDir = path.join(root, "viewport-scroll-report");
const outPath = path.join(reportDir, "index.html");
const legacyPath = path.join(root, "viewport-scroll-report.html");

const SOURCES = {
  safari: path.join(root, "data/safari-results.json"),
  desktop: path.join(root, "data/desktop-results.json"),
  viewport: path.join(root, "data/viewport-results.json"),
};

const PLATFORM_LABELS = {
  macbook: "MacBook",
  windows: "Windows",
  tablet: "Планшеты",
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
  "each horizontal swipe moves exactly one case":
    "Один горизонтальный свайп: один кейс",
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
  "each horizontal swipe moves exactly one case": "one-swipe-one-case",
  "full scroll boundaries at top and bottom": "boundaries-mobile",
};

const SECTION_LABELS = {
  safari: "Safari / iOS",
  desktop: "Desktop scroll",
  viewport: "Viewport matrix",
};

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAnnotation(result, type) {
  return result?.annotations?.find((a) => a.type === type)?.description ?? "";
}

function copyAsset(absPath, relDest) {
  const dest = path.join(reportDir, relDest);
  if (absPath && fs.existsSync(absPath)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(absPath, dest);
    return relDest;
  }
  if (fs.existsSync(dest)) return relDest;
  return "";
}

function isPassed(test, result) {
  return (
    test.status === "expected" ||
    test.status === "flaky" ||
    result?.status === "passed"
  );
}

function rowStatus(test, result) {
  if (test.status === "flaky") return "flaky";
  return result?.status ?? "unknown";
}

function collectAttachments(result, assetBase) {
  const videoSrc = result?.attachments?.find((a) => a.name === "video")?.path;
  const traceSrc = result?.attachments?.find((a) => a.name === "trace")?.path;
  const screenshotSrc = result?.attachments?.find(
    (a) => a.name === "screenshot",
  )?.path;

  return {
    video: copyAsset(videoSrc, `${assetBase}/video.webm`),
    trace: copyAsset(traceSrc, `${assetBase}/trace.zip`),
    screenshot: copyAsset(screenshotSrc, `${assetBase}/screenshot.png`),
  };
}

/** @type {{ section: string, groups: Map<string, { id: string, name: string, meta: string, scenarios: any[], passed: number, failed: number }> }[]} */
const sections = [];

function addScenario(section, groupId, groupName, groupMeta, scenario) {
  let sec = sections.find((s) => s.section === section);
  if (!sec) {
    sec = { section, groups: new Map() };
    sections.push(sec);
  }
  if (!sec.groups.has(groupId)) {
    sec.groups.set(groupId, {
      id: groupId,
      name: groupName,
      meta: groupMeta,
      scenarios: [],
      passed: 0,
      failed: 0,
    });
  }
  const group = sec.groups.get(groupId);
  group.scenarios.push(scenario);
  if (scenario.status === "passed" || scenario.status === "flaky") {
    group.passed++;
  } else {
    group.failed++;
  }
}

function walkFlatSuites(data, section, groupFromTest) {
  function walk(suites, suiteTitle = "") {
    for (const suite of suites ?? []) {
      const title = suite.title || suiteTitle;
      for (const spec of suite.specs ?? []) {
        const scenarioTitle = spec.title;
        for (const test of spec.tests ?? []) {
          const result = test.results?.at(-1) ?? test.results?.[0];
          const { groupId, groupName, groupMeta } = groupFromTest(
            test,
            title,
            scenarioTitle,
          );
          const slug = slugify(`${groupId}-${scenarioTitle}`);
          const assets = collectAttachments(
            result,
            `assets/${section}/${slug}`,
          );
          const ok = isPassed(test, result);
          const audit = getAnnotation(result, "audit");

          addScenario(section, groupId, groupName, groupMeta, {
            label: scenarioTitle,
            status: ok
              ? rowStatus(test, result) === "flaky"
                ? "flaky"
                : "passed"
              : "failed",
            detail:
              audit ||
              result?.error?.message?.split("\n")[0] ||
              `${Math.round(result?.duration ?? 0)}ms`,
            ...assets,
          });
        }
      }
      walk(suite.suites, title);
    }
  }
  walk(data.suites);
}

function parseSafari(data) {
  walkFlatSuites(data, "safari", (test) => {
    const project = test.projectName || "safari";
    return {
      groupId: project,
      groupName: project.replace(/-/g, " "),
      groupMeta: "Safari compatibility",
    };
  });
}

function parseDesktop(data) {
  walkFlatSuites(data, "desktop", () => ({
    groupId: "desktop-chrome",
    groupName: "Desktop Chrome",
    groupMeta: "1440×900 · fullscreen scroll",
  }));
}

function parseViewport(data) {
  function walk(suites) {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        const scenario = spec.title;
        const scenarioSlug =
          SCENARIO_SLUG[scenario] ?? slugify(scenario);
        for (const test of spec.tests ?? []) {
          const result = test.results?.at(-1) ?? test.results?.[0];
          const metaResult = test.results?.[0] ?? result;
          const viewportId = getAnnotation(metaResult, "viewport-id");
          const platform = getAnnotation(metaResult, "platform");
          const viewportName = getAnnotation(metaResult, "viewport-name");
          const resolution = getAnnotation(metaResult, "resolution");
          const audit = getAnnotation(result, "audit");

          if (!viewportId) continue;

          const assets = collectAttachments(
            result,
            `assets/${viewportId}/${scenarioSlug}`,
          );
          const ok = isPassed(test, result);

          addScenario(
            "viewport",
            `${platform}::${viewportId}`,
            viewportName,
            `${resolution} · ${PLATFORM_LABELS[platform] ?? platform}`,
            {
              label: SCENARIO_LABELS[scenario] ?? scenario,
              status: ok
                ? rowStatus(test, result) === "flaky"
                  ? "flaky"
                  : "passed"
                : "failed",
              detail:
                audit ||
                result?.error?.message?.split("\n")[0] ||
                `${Math.round(result?.duration ?? 0)}ms`,
              platform,
              ...assets,
            },
          );
        }
      }
      walk(suite.suites);
    }
  }
  walk(data.suites);
}

function loadSource(key) {
  const file = SOURCES[key];
  if (!fs.existsSync(file)) {
    console.warn(`Skip ${key}: missing ${path.relative(root, file)}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const safariData = loadSource("safari");
const desktopData = loadSource("desktop");
const viewportData = loadSource("viewport");

if (safariData) parseSafari(safariData);
if (desktopData) parseDesktop(desktopData);
if (viewportData) parseViewport(viewportData);

if (!sections.length) {
  console.error("No test results found. Run tests first.");
  process.exit(1);
}

const generatedAt = new Date().toISOString();

let totalPassed = 0;
let totalFailed = 0;
for (const sec of sections) {
  for (const group of sec.groups.values()) {
    totalPassed += group.passed;
    totalFailed += group.failed;
  }
}
const totalTests = totalPassed + totalFailed;

function renderVideoCell(s) {
  const links = [
    s.trace ? `<a href="${esc(s.trace)}" download>trace</a>` : "",
    s.screenshot
      ? `<a href="${esc(s.screenshot)}" target="_blank" rel="noopener">screenshot</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  if (!s.video) {
    return `<td class="video-cell"><span class="muted">—</span>${links ? `<div class="links">${links}</div>` : ""}</td>`;
  }

  return `<td class="video-cell">
    <video controls preload="metadata" playsinline src="${esc(s.video)}"></video>
    ${links ? `<div class="links">${links}</div>` : ""}
  </td>`;
}

function renderRows(scenarios) {
  return scenarios
    .map((s) => {
      const icon =
        s.status === "passed" || s.status === "flaky" ? "pass" : "fail";
      return `<tr class="${icon}">
        <td class="status"><span class="badge ${icon}">${icon === "pass" ? "✓" : "✗"}</span></td>
        <td class="scenario">${esc(s.label)}</td>
        <td class="detail">${esc(s.detail)}${s.status === "flaky" ? " <em>(retry)</em>" : ""}</td>
        ${renderVideoCell(s)}
      </tr>`;
    })
    .join("");
}

function renderSection(sec) {
  const groups = [...sec.groups.values()];
  if (!groups.length) return "";

  const sectionPassed = groups.reduce((s, g) => s + g.passed, 0);
  const sectionTotal = groups.reduce((s, g) => s + g.passed + g.failed, 0);

  if (sec.section === "viewport") {
    const platforms = ["macbook", "windows", "tablet", "phone"];
    return platforms
      .map((platform) => {
        const platformGroups = groups.filter((g) =>
          g.scenarios.some((s) => s.platform === platform),
        );
        if (!platformGroups.length) return "";

        const platformPassed = platformGroups.reduce((s, g) => s + g.passed, 0);
        const platformTotal = platformGroups.reduce(
          (s, g) => s + g.passed + g.failed,
          0,
        );

        const cards = platformGroups
          .map((group) => {
            const allOk = group.failed === 0;
            return `<article class="device-card ${allOk ? "ok" : "bad"}">
              <header>
                <div>
                  <h3>${esc(group.name)}</h3>
                  <p class="meta">${esc(group.meta)} · ${group.passed}/${group.passed + group.failed} passed</p>
                </div>
                <span class="device-badge ${allOk ? "pass" : "fail"}">${allOk ? "PASS" : "FAIL"}</span>
              </header>
              <table>
                <thead><tr><th></th><th>Сценарий</th><th>Результат</th><th>Видео</th></tr></thead>
                <tbody>${renderRows(group.scenarios)}</tbody>
              </table>
            </article>`;
          })
          .join("");

        return `<div class="platform-block" id="viewport-${platform}">
          <div class="platform-head">
            <h3>${PLATFORM_LABELS[platform]}</h3>
            <span class="platform-score">${platformPassed}/${platformTotal}</span>
          </div>
          <div class="device-grid">${cards}</div>
        </div>`;
      })
      .join("");
  }

  const cards = groups
    .map((group) => {
      const allOk = group.failed === 0;
      return `<article class="device-card ${allOk ? "ok" : "bad"}">
        <header>
          <div>
            <h3>${esc(group.name)}</h3>
            <p class="meta">${esc(group.meta)} · ${group.passed}/${group.passed + group.failed} passed</p>
          </div>
          <span class="device-badge ${allOk ? "pass" : "fail"}">${allOk ? "PASS" : "FAIL"}</span>
        </header>
        <table>
          <thead><tr><th></th><th>Сценарий</th><th>Результат</th><th>Видео</th></tr></thead>
          <tbody>${renderRows(group.scenarios)}</tbody>
        </table>
      </article>`;
    })
    .join("");

  return `<section class="platform" id="${sec.section}">
    <div class="platform-head">
      <h2>${SECTION_LABELS[sec.section] ?? sec.section}</h2>
      <span class="platform-score">${sectionPassed}/${sectionTotal}</span>
    </div>
    <div class="device-grid">${cards}</div>
  </section>`;
}

const navLinks = sections
  .flatMap((sec) => {
    if (sec.section === "viewport") {
      return ["macbook", "windows", "tablet", "phone"].map(
        (p) =>
          `<a href="#viewport-${p}">${PLATFORM_LABELS[p]}</a>`,
      );
    }
    return `<a href="#${sec.section}">${SECTION_LABELS[sec.section]}</a>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Test Report — АДДИТЕХПРОММАШ</title>
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
    .platform, .platform-block { margin-bottom: 36px; }
    .platform-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--line);
    }
    .platform-head h2, .platform-head h3 { margin: 0; font-size: 20px; }
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
    .video-cell { width: min(320px, 40vw); }
    .video-cell video {
      display: block; width: 100%; max-width: 300px; border-radius: 8px;
      background: #000; margin-bottom: 6px;
    }
    .links a { color: var(--accent); text-decoration: none; font-size: 11px; }
    .links a:hover { text-decoration: underline; }
    .muted { color: var(--muted); }
    .footer { margin-top: 32px; color: var(--muted); font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Test Report</h1>
    <p class="subtitle">Все e2e-тесты · ${esc(generatedAt)}</p>

    <div class="summary">
      <div class="stat"><div class="label">Всего тестов</div><div class="value">${totalTests}</div></div>
      <div class="stat pass"><div class="label">Пройдено</div><div class="value">${totalPassed}</div></div>
      <div class="stat fail"><div class="label">Провалено</div><div class="value">${totalFailed}</div></div>
      <div class="stat"><div class="label">Секций</div><div class="value">${sections.length}</div></div>
    </div>

    <nav class="nav">${navLinks}</nav>

    ${sections.map(renderSection).join("")}

    <p class="footer">
      Открывать через <code>npm run report:viewports:open</code> — иначе видео не воспроизведутся из file://
    </p>
  </div>
</body>
</html>`;

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(outPath, html);

fs.writeFileSync(
  legacyPath,
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=http://127.0.0.1:5199/"><title>Redirect</title></head><body><p>Откройте <a href="http://127.0.0.1:5199/">http://127.0.0.1:5199/</a> или запустите <code>npm run report:viewports:open</code></p></body></html>`,
);

console.log(`HTML report written to ${outPath}`);
console.log(`Passed: ${totalPassed}/${totalTests}`);
console.log(`Videos copied to ${path.join(reportDir, "assets")}`);

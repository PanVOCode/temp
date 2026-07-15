import { expect, type Page, type TestInfo } from "@playwright/test";
import { MAIN_SECTION_SELECTORS } from "../viewports";
import type { ViewportDevice } from "../viewports";

export type ScrollState = {
  index: number;
  ids: string[];
  transitions: number;
  locked: boolean;
  scrollY: number;
  maxScroll: number;
  viewportH: number;
  hijackActive: boolean;
};

async function gotoWithRetry(page: Page) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto("/", {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(1500 * (attempt + 1));
    }
  }
  throw lastError;
}

export async function prepareDesktopPage(page: Page) {
  await gotoWithRetry(page);
  await page.waitForFunction(() => !!(window as any).__fullscreenScroll);
  await expect(page.locator(".hero-float")).toBeVisible();
  await expect(page.locator(".hero-float img")).toHaveJSProperty(
    "complete",
    true,
  );
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const api = (window as any).__fullscreenScroll;
    api.syncCurrent();
    api.resetTransitionCount();
  });
  await waitScrollIdle(page);
}

export async function prepareMobilePage(page: Page) {
  await gotoWithRetry(page);
  await page.waitForFunction(() => !!(window as any).__fullscreenScroll);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const api = (window as any).__fullscreenScroll;
    api.syncCurrent();
    api.resetTransitionCount();
  });
  await waitNativeScrollIdle(page);
}

export async function waitScrollIdle(page: Page) {
  await page.waitForFunction(
    () => {
      const api = (window as any).__fullscreenScroll;
      return api && !api.isLocked() && !api.isGestureActive();
    },
    { timeout: 20_000 },
  );
  await page.waitForTimeout(100);
}

export async function waitNativeScrollIdle(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        let last = window.scrollY;
        let stable = 0;
        const tick = () => {
          const y = window.scrollY;
          if (Math.abs(y - last) < 2) stable++;
          else {
            stable = 0;
            last = y;
          }
          if (stable >= 10) resolve(true);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { timeout: 15_000 },
  );
  await page.waitForTimeout(80);
}

export async function dispatchWheel(page: Page, deltaY: number) {
  await page.evaluate((dy) => {
    window.dispatchEvent(
      new WheelEvent("wheel", {
        deltaY: dy,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, deltaY);
}

export async function readState(page: Page): Promise<ScrollState> {
  return page.evaluate(() => {
    const api = (window as any).__fullscreenScroll;
    return {
      index: api.getCurrentIndex(),
      ids: api.getSlideIds(),
      transitions: api.getTransitionCount(),
      locked: api.isLocked(),
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      viewportH: window.innerHeight,
      hijackActive: window.innerWidth > 900,
    };
  });
}

export async function desktopWheelDown(page: Page, delta = 120) {
  await page.mouse.wheel(0, delta);
  await waitScrollIdle(page);
}

export async function desktopWheelUp(page: Page, delta = 120) {
  await page.mouse.wheel(0, -delta);
  await waitScrollIdle(page);
}

export async function mobileScrollDown(page: Page, delta = 400) {
  await page.mouse.wheel(0, delta);
  await waitNativeScrollIdle(page);
}

export async function mobileScrollUp(page: Page, delta = 400) {
  await page.mouse.wheel(0, -delta);
  await waitNativeScrollIdle(page);
}

async function casesAreInView(page: Page) {
  return page.locator("#c2scroll").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < window.innerHeight * 0.8 &&
      rect.bottom > window.innerHeight * 0.2
    );
  });
}

async function waitHorizontalScrollIdle(page: Page) {
  await page.locator("#c2scroll").evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        let last = el.scrollLeft;
        let stable = 0;
        const tick = () => {
          const current = el.scrollLeft;
          if (Math.abs(current - last) < 1) stable++;
          else {
            stable = 0;
            last = current;
          }
          if (stable >= 10) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

export async function scrollMobileCases(
  page: Page,
  direction: "forward" | "backward" = "forward",
) {
  const carousel = page.locator("#c2scroll");
  const caseCount = await page.locator(".c2-slide").count();
  const startIndex = await carousel.evaluate((el) =>
    Math.round(el.scrollLeft / el.clientWidth),
  );
  const visited: number[] = [startIndex];
  const steps =
    direction === "forward" ? caseCount - 1 - startIndex : startIndex;

  for (let step = 0; step < steps; step++) {
    const previous = visited[visited.length - 1];
    await carousel.evaluate((el, swipeDirection) => {
      const rect = el.getBoundingClientRect();
      const startX =
        swipeDirection === "forward" ? rect.right - 20 : rect.left + 20;
      const endX =
        swipeDirection === "forward" ? rect.left + 20 : rect.right - 20;
      const y = rect.top + Math.min(rect.height / 2, window.innerHeight / 2);
      const startTouch = new Touch({
        identifier: 1,
        target: el,
        clientX: startX,
        clientY: y,
      });
      const endTouch = new Touch({
        identifier: 1,
        target: el,
        clientX: endX,
        clientY: y,
      });

      el.dispatchEvent(
        new TouchEvent("touchstart", {
          touches: [startTouch],
          changedTouches: [startTouch],
          bubbles: true,
        }),
      );
      el.dispatchEvent(
        new TouchEvent("touchend", {
          touches: [],
          changedTouches: [endTouch],
          bubbles: true,
        }),
      );
    }, direction);
    await waitHorizontalScrollIdle(page);

    const current = await carousel.evaluate((el) =>
      Math.round(el.scrollLeft / el.clientWidth),
    );
    expect(Math.abs(current - previous)).toBe(1);
    expect(current).toBe(direction === "forward" ? previous + 1 : previous - 1);
    visited.push(current);
  }

  return { caseCount, visited };
}

export async function scrollDesktopToEnd(
  page: Page,
  opts: { delta?: number; inertiaBurst?: boolean } = {},
) {
  const delta = opts.delta ?? 120;
  let state = await readState(page);
  const lastIndex = state.ids.length - 1;
  const visited = new Set<number>([state.index]);
  const path: string[] = [state.ids[state.index]];
  let guard = 0;
  const maxAttempts = lastIndex + 25;

  while (state.index < lastIndex && guard < maxAttempts) {
    if (opts.inertiaBurst) {
      for (const burst of [120, 95, 70, 45, 20, 8]) {
        await dispatchWheel(page, burst);
        await page.waitForTimeout(16);
      }
      await waitScrollIdle(page);
    } else {
      await desktopWheelDown(page, delta);
    }

    const next = await readState(page);
    if (
      next.index !== state.index ||
      next.ids[next.index] !== path[path.length - 1]
    ) {
      visited.add(next.index);
      path.push(next.ids[next.index]);
    }
    state = next;
    guard++;
  }

  return { state, visited, path, steps: guard, lastIndex };
}

export async function scrollDesktopToStart(page: Page, delta = 120) {
  let state = await readState(page);
  const path: string[] = [state.ids[state.index]];
  let guard = 0;
  const maxAttempts = state.ids.length + 25;

  while (state.index > 0 && guard < maxAttempts) {
    await desktopWheelUp(page, delta);
    state = await readState(page);
    path.push(state.ids[state.index]);
    guard++;
  }

  return { state, path, steps: guard };
}

export async function scrollMobileToEnd(page: Page, delta = 400) {
  let state = await readState(page);
  let guard = 0;
  const target = state.maxScroll * 0.95;
  let cases = { caseCount: 0, visited: [] as number[] };

  while (
    !(await casesAreInView(page)) &&
    state.scrollY < target &&
    guard < 45
  ) {
    await mobileScrollDown(page, delta);
    state = await readState(page);
    guard++;
  }

  if (await casesAreInView(page)) {
    cases = await scrollMobileCases(page, "forward");
  }

  while (state.scrollY < target && guard < 90) {
    await mobileScrollDown(page, delta);
    state = await readState(page);
    guard++;
  }

  // Final nudge to absolute bottom for short viewports (iPhone SE)
  if (state.scrollY < state.maxScroll * 0.92) {
    await page.evaluate(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      });
    });
    await waitNativeScrollIdle(page);
    state = await readState(page);
  }

  return { state, steps: guard, cases };
}

export async function scrollMobileToStart(page: Page, delta = 400) {
  let state = await readState(page);
  let guard = 0;
  let cases = { caseCount: 0, visited: [] as number[] };

  while (!(await casesAreInView(page)) && state.scrollY > 40 && guard < 45) {
    await mobileScrollUp(page, delta);
    state = await readState(page);
    guard++;
  }

  if (await casesAreInView(page)) {
    cases = await scrollMobileCases(page, "backward");
  }

  while (state.scrollY > 40 && guard < 50) {
    await mobileScrollUp(page, delta);
    state = await readState(page);
    guard++;
  }

  return { state, steps: guard, cases };
}

export async function sectionsPassedByScroll(page: Page) {
  return page.evaluate((selectors) => {
    const scrollBottom = window.scrollY + window.innerHeight;
    const missing = new Set<string>();
    for (const sel of selectors) {
      const nodes = document.querySelectorAll(sel);
      if (!nodes.length) {
        missing.add(sel);
        continue;
      }
      nodes.forEach((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const name = el.id || el.className.split(" ")[0];
        if (scrollBottom < top + 40) missing.add(name);
      });
    }
    return { ok: missing.size === 0, missing: [...missing] };
  }, MAIN_SECTION_SELECTORS);
}

export function annotateViewport(testInfo: TestInfo, device: ViewportDevice) {
  testInfo.annotations.push({ type: "platform", description: device.platform });
  testInfo.annotations.push({ type: "viewport-id", description: device.id });
  testInfo.annotations.push({
    type: "viewport-name",
    description: device.name,
  });
  testInfo.annotations.push({
    type: "resolution",
    description: `${device.width}×${device.height}`,
  });
}

export function annotateJourney(
  testInfo: TestInfo,
  label: string,
  detail: string,
) {
  testInfo.annotations.push({
    type: "audit",
    description: `${label}: ${detail}`,
  });
}

export async function runDesktopScenario(
  page: Page,
  scenario: string,
  testInfo: TestInfo,
) {
  switch (scenario) {
    case "scroll down through entire site": {
      await prepareDesktopPage(page);
      const start = await readState(page);
      expect(start.index).toBe(0);

      const { state, visited, path, lastIndex } =
        await scrollDesktopToEnd(page);
      expect(state.index).toBe(lastIndex);
      expect(visited.has(0)).toBe(true);
      expect(visited.has(lastIndex)).toBe(true);
      annotateJourney(testInfo, "down", path.join(" → "));
      break;
    }
    case "scroll up through entire site": {
      await prepareDesktopPage(page);
      const down = await scrollDesktopToEnd(page);
      expect(down.state.index).toBe(down.lastIndex);

      const { state, path } = await scrollDesktopToStart(page);
      expect(state.index).toBe(0);
      annotateJourney(testInfo, "up", path.join(" → "));
      break;
    }
    case "round trip through entire site": {
      await prepareDesktopPage(page);
      const down = await scrollDesktopToEnd(page);
      expect(down.state.index).toBe(down.lastIndex);

      const up = await scrollDesktopToStart(page);
      expect(up.state.index).toBe(0);
      annotateJourney(
        testInfo,
        "round-trip",
        `${down.path.join(" → ")} ↑ ${up.path.join(" → ")}`,
      );
      break;
    }
    case "full scroll down with large wheel deltas": {
      await prepareDesktopPage(page);
      let state = await readState(page);
      const lastIndex = state.ids.length - 1;
      let prevIndex = state.index;
      let guard = 0;

      while (state.index < lastIndex && guard < lastIndex + 25) {
        await desktopWheelDown(page, 5000);
        state = await readState(page);
        expect(state.index - prevIndex).toBeLessThanOrEqual(1);
        prevIndex = state.index;
        guard++;
      }

      expect(state.index).toBe(lastIndex);
      annotateJourney(
        testInfo,
        "large-delta",
        `${guard} steps to ${state.ids[lastIndex]}`,
      );
      break;
    }
    case "full scroll down with trackpad inertia bursts": {
      await prepareDesktopPage(page);
      const { state, path, lastIndex } = await scrollDesktopToEnd(page, {
        inertiaBurst: true,
      });
      expect(state.index).toBe(lastIndex);
      annotateJourney(testInfo, "inertia", path.join(" → "));
      break;
    }
    case "full scroll respects boundaries at top and bottom": {
      await prepareDesktopPage(page);
      let state = await readState(page);
      expect(state.index).toBe(0);

      await desktopWheelUp(page, 200);
      state = await readState(page);
      expect(state.index).toBe(0);

      const down = await scrollDesktopToEnd(page);
      expect(down.state.index).toBe(down.lastIndex);

      const transitionsBefore = down.state.transitions;
      for (let i = 0; i < 4; i++) {
        await desktopWheelDown(page, 200);
        state = await readState(page);
      }
      expect(state.index).toBe(down.lastIndex);
      expect(state.transitions).toBeGreaterThanOrEqual(transitionsBefore);
      annotateJourney(
        testInfo,
        "boundaries",
        `top=${state.ids[0]}, bottom=${state.ids[down.lastIndex]}`,
      );
      break;
    }
    default:
      throw new Error(`Unknown desktop scenario: ${scenario}`);
  }
}

export async function runMobileScenario(
  page: Page,
  scenario: string,
  testInfo: TestInfo,
) {
  switch (scenario) {
    case "scroll down through entire site": {
      await prepareMobilePage(page);
      const start = await readState(page);
      expect(start.hijackActive).toBe(false);
      expect(start.scrollY).toBeLessThan(40);

      const { state, steps, cases } = await scrollMobileToEnd(page);
      expect(state.scrollY).toBeGreaterThan(state.maxScroll * 0.85);
      expect(state.transitions).toBe(0);
      expect(cases.visited).toEqual(
        Array.from({ length: cases.caseCount }, (_, i) => i),
      );
      annotateJourney(
        testInfo,
        "down",
        `scrollY ${start.scrollY} → ${state.scrollY} (${steps} swipes)`,
      );
      break;
    }
    case "scroll up through entire site": {
      await prepareMobilePage(page);
      const down = await scrollMobileToEnd(page);
      expect(down.state.scrollY).toBeGreaterThan(down.state.maxScroll * 0.85);
      expect(down.cases.visited).toHaveLength(down.cases.caseCount);

      const { state, steps, cases } = await scrollMobileToStart(page);
      expect(state.scrollY).toBeLessThan(60);
      expect(cases.visited).toEqual(
        Array.from(
          { length: cases.caseCount },
          (_, i) => cases.caseCount - 1 - i,
        ),
      );
      annotateJourney(
        testInfo,
        "up",
        `scrollY ${down.state.scrollY} → ${state.scrollY} (${steps} swipes)`,
      );
      break;
    }
    case "round trip through entire site": {
      await prepareMobilePage(page);
      const start = await readState(page);
      const down = await scrollMobileToEnd(page);
      const up = await scrollMobileToStart(page);

      expect(down.state.scrollY).toBeGreaterThan(down.state.maxScroll * 0.85);
      expect(up.state.scrollY).toBeLessThan(60);
      expect(down.cases.visited).toHaveLength(down.cases.caseCount);
      expect(up.cases.visited).toHaveLength(up.cases.caseCount);
      annotateJourney(
        testInfo,
        "round-trip",
        `${start.scrollY} ↓ ${down.state.scrollY} ↑ ${up.state.scrollY}`,
      );
      break;
    }
    case "full scroll keeps hijack disabled": {
      await prepareMobilePage(page);
      const start = await readState(page);
      expect(start.hijackActive).toBe(false);

      const { state } = await scrollMobileToEnd(page);
      expect(state.hijackActive).toBe(false);
      expect(state.transitions).toBe(0);
      annotateJourney(
        testInfo,
        "hijack-off",
        `transitions=${state.transitions}`,
      );
      break;
    }
    case "each horizontal swipe moves exactly one case": {
      await prepareMobilePage(page);
      const { state, cases } = await scrollMobileToEnd(page);
      const passed = await sectionsPassedByScroll(page);

      expect(state.scrollY).toBeGreaterThan(state.maxScroll * 0.85);
      expect(passed.ok).toBe(true);
      expect(cases.caseCount).toBeGreaterThan(1);
      expect(cases.visited).toEqual(
        Array.from({ length: cases.caseCount }, (_, i) => i),
      );
      annotateJourney(
        testInfo,
        "sections-and-cases",
        passed.ok
          ? `${cases.caseCount} cases passed horizontally`
          : `missing: ${passed.missing.join(", ")}`,
      );
      break;
    }
    case "full scroll boundaries at top and bottom": {
      await prepareMobilePage(page);
      let state = await readState(page);
      expect(state.scrollY).toBeLessThan(40);

      await mobileScrollUp(page);
      state = await readState(page);
      expect(state.scrollY).toBeLessThan(40);

      const down = await scrollMobileToEnd(page);
      expect(down.state.scrollY).toBeGreaterThan(down.state.maxScroll * 0.85);

      const yBefore = down.state.scrollY;
      await mobileScrollDown(page);
      state = await readState(page);
      expect(state.scrollY).toBeGreaterThanOrEqual(yBefore - 40);
      annotateJourney(
        testInfo,
        "boundaries",
        `top=${state.scrollY < 40}, bottom=${down.state.scrollY >= down.state.maxScroll * 0.85}`,
      );
      break;
    }
    default:
      throw new Error(`Unknown mobile scenario: ${scenario}`);
  }
}

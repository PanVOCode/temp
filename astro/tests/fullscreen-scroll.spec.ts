import { expect, test } from "@playwright/test";
import { DESKTOP_SCENARIOS } from "./viewports";
import {
  dispatchWheel,
  prepareDesktopPage,
  readState,
  runDesktopScenario,
  waitScrollIdle,
} from "./helpers/scroll-helpers";

test.describe("fullscreen-scroll", () => {
  for (const scenario of DESKTOP_SCENARIOS) {
    test(scenario, async ({ page }, testInfo) => {
      test.setTimeout(300_000);
      await runDesktopScenario(page, scenario, testInfo);
    });
  }

  test("mouse wheel responds immediately after transition", async ({
    page,
  }) => {
    await prepareDesktopPage(page);

    await dispatchWheel(page, 120);
    await page.waitForFunction(
      () => !(window as any).__fullscreenScroll.isLocked(),
    );
    const afterFirst = await readState(page);
    expect(afterFirst.index).toBe(1);

    await dispatchWheel(page, 120);
    await waitScrollIdle(page);
    const afterSecond = await readState(page);

    expect(afterSecond.index).toBe(2);
    expect(afterSecond.transitions).toBe(2);
  });

  test("long trackpad tail remains one gesture", async ({ page }) => {
    await prepareDesktopPage(page);

    for (let i = 0; i < 45; i++) {
      const delta = Math.max(4, Math.round(120 * (1 - i / 45) ** 2));
      await dispatchWheel(page, delta);
      await page.waitForTimeout(20);
    }
    await waitScrollIdle(page);

    const state = await readState(page);
    expect(state.index).toBe(1);
    expect(state.transitions).toBe(1);
  });
});

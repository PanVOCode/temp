import { test } from "@playwright/test";
import { DESKTOP_SCENARIOS } from "./viewports";
import { runDesktopScenario } from "./helpers/scroll-helpers";

test.describe("fullscreen-scroll", () => {
  for (const scenario of DESKTOP_SCENARIOS) {
    test(scenario, async ({ page }, testInfo) => {
      test.setTimeout(300_000);
      await runDesktopScenario(page, scenario, testInfo);
    });
  }
});

import { test } from "@playwright/test";
import {
  ALL_VIEWPORT_GROUPS,
  DESKTOP_SCENARIOS,
  MOBILE_SCENARIOS,
  type ViewportDevice,
} from "./viewports";
import {
  annotateViewport,
  runDesktopScenario,
  runMobileScenario,
} from "./helpers/scroll-helpers";

function describeViewport(device: ViewportDevice) {
  const nativeScroll = !!(device.nativeScroll || device.isMobile);
  const scenarios = nativeScroll ? MOBILE_SCENARIOS : DESKTOP_SCENARIOS;

  test.describe(`${device.platform} · ${device.name} (${device.width}×${device.height})`, () => {
    test.use({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.dpr,
      hasTouch: !!(device.hasTouch ?? device.isMobile),
      isMobile: !!device.isMobile,
    });

    for (const scenario of scenarios) {
      test(scenario, async ({ page }, testInfo) => {
        test.setTimeout(300_000);
        annotateViewport(testInfo, device);
        if (nativeScroll) {
          await runMobileScenario(page, scenario, testInfo);
        } else {
          await runDesktopScenario(page, scenario, testInfo);
        }
      });
    }
  });
}

test.describe("viewport-scroll", () => {
  for (const group of ALL_VIEWPORT_GROUPS) {
    test.describe(group.label, () => {
      for (const device of group.devices) {
        describeViewport(device);
      }
    });
  }
});

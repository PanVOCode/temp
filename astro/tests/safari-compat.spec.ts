import { expect, test } from "@playwright/test";

/** Opacity of an element (0 if detached or hidden). */
async function opacity(page: import("@playwright/test").Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const o = getComputedStyle(el).opacity;
    return o === "" ? 1 : Number.parseFloat(o);
  });
}

test.describe("Safari / iOS compatibility", () => {
  test("hero and services text visible with JS enabled", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".hero-tagline")).toBeVisible();
    expect(await opacity(page, ".hero-sub.reveal")).toBeGreaterThan(0.9);

    await page.locator("#services").scrollIntoViewIfNeeded();
    await expect(page.locator(".svc-name").first()).toBeVisible();
    await expect(page.locator(".svc-name").first()).toContainText(
      "Проектирование пресс-форм",
    );
    await expect
      .poll(async () => opacity(page, ".services .svc-row.reveal"), {
        timeout: 3000,
      })
      .toBeGreaterThan(0.9);
  });

  test("case images are not stuck at opacity 0", async ({ page }) => {
    await page.goto("/#projects");
    await page.waitForLoadState("networkidle");

    const caseImg = page.locator(".c2-img-col img").first();
    await expect(caseImg).toBeAttached();

    // Wait for decode/load handler or fallback timeout in main.ts
    await page.waitForFunction(
      () => {
        const img = document.querySelector<HTMLImageElement>(".c2-img-col img");
        if (!img) return false;
        const o = Number.parseFloat(getComputedStyle(img).opacity);
        return o > 0.1 || img.classList.contains("is-loaded");
      },
      { timeout: 5000 },
    );

    expect(await opacity(page, ".c2-img-col img")).toBeGreaterThan(0.1);
  });

  test("content stays visible when JavaScript is disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator(".hero-tagline")).toBeVisible();
    await expect(page.locator(".hero-tagline")).toContainText(
      "Российское производство",
    );
    await expect(page.locator(".clip-inner--solid")).toContainText("ПРЕСС");
    await expect(page.locator(".svc-name").first()).toBeVisible();

    expect(await opacity(page, ".hero-sub")).toBeGreaterThan(0.9);
    expect(await opacity(page, ".svc-row")).toBeGreaterThan(0.9);
    expect(await opacity(page, ".c2-img-col img")).toBeGreaterThan(0.1);

    await context.close();
  });

  test("in-viewport reveal blocks are shown on load (IO Safari quirk)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Hero .reveal is in the first screen — must not stay hidden
    await expect
      .poll(async () => opacity(page, ".hero-sub.reveal"), { timeout: 3000 })
      .toBeGreaterThan(0.9);

    await page.locator("#services").scrollIntoViewIfNeeded();
    await expect
      .poll(async () => opacity(page, ".services .svc-row.reveal"), {
        timeout: 3000,
      })
      .toBeGreaterThan(0.9);
  });
});

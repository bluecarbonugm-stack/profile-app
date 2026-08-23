import { expect, test } from "@playwright/test";

import { ProfilePage } from "./pages/profile.page";

test.describe("Web Profile", () => {
  test("renders the hero and every content section server-side", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();

    await expect(profile.heading).toBeVisible();
    await expect(profile.heading).toContainText("Memetakan ekosistem");

    // The full fallback dataset populates every section. This is the assertion
    // that would have caught the live-sheet collapse documented in the review.
    const ids = await profile.allSectionIds;
    expect(ids).toEqual(
      expect.arrayContaining([
        "tentang",
        "fokus",
        "tim",
        "publikasi",
        "studi-kasus",
        "galeri",
        "mitra",
        "kontak",
      ]),
    );
  });

  test("section eyebrow numbering is contiguous with no gaps", async ({ page }) => {
    await page.goto("/");

    // ProfilePage assigns ordinals only to sections that actually render, so a
    // gap here means the numbering logic drifted from the visibility logic.
    const numbers = await page
      .locator("main section .eyebrow span")
      .filter({ hasText: /^\d{2}$/ })
      .allInnerTexts();

    const parsed = numbers.map(Number);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed).toEqual(parsed.map((_, i) => i + 1));
  });

  test("content is server-rendered, not client-fetched", async ({ page }) => {
    // Disabling JS proves the content is in the SSR payload — important for SEO
    // and for the crawler story the profile exists to serve.
    await page.context().addInitScript(() => {});
    const response = await page.goto("/");
    const html = (await response?.text()) ?? "";

    expect(html).toContain("Memetakan ekosistem");
    expect(html).toContain('id="publikasi"');
    expect(html).toContain('id="tim"');
  });

  test("publikasi anchor scrolls clear of the sticky header", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();

    await profile.publicationsLink.click();
    await expect(page).toHaveURL(/#publikasi$/);

    const headerBox = await page.locator("header").boundingBox();
    const sectionBox = await profile.section("publikasi").boundingBox();

    expect(headerBox).not.toBeNull();
    expect(sectionBox).not.toBeNull();
    // The section must start below the sticky header, not underneath it.
    expect(sectionBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
  });

  test("navigates to the workbench via the hero CTA", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();

    await profile.workbenchCta.click();
    await expect(page).toHaveURL(/\/processing$/);
  });

  test("contact form blocks submission until required fields are filled", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.section("kontak").scrollIntoViewIfNeeded();

    const nama = profile.field("Nama");
    await expect(nama).toBeVisible();

    // Native constraint validation must reject an empty required field.
    await profile.submitButton.click();
    const validity = await nama.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test("every image carries an alt attribute", async ({ page }) => {
    await page.goto("/");
    const missing = await page
      .locator("img:not([alt])")
      .evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    expect(missing).toEqual([]);
  });

  test("page declares a language matching its content", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    // Copy is Indonesian throughout — see the adversarial review finding.
    expect(lang).toBe("id");
  });

  test("no console errors during load and hydration", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
});

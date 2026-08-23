import { expect, test } from "@playwright/test";

test.describe("Site navigation", () => {
  test("header theme follows the route", async ({ page }) => {
    await page.goto("/");
    const light = await page
      .locator("header")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.goto("/processing");
    const dark = await page
      .locator("header")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    // The workbench is a dark tool surface; a light header on it was a real bug.
    expect(light).not.toBe(dark);
  });

  test("unknown route renders the branded 404, not a crash", async ({ page }) => {
    const response = await page.goto("/tidak-ada-halaman-ini");

    await expect(page.getByRole("heading", { name: /Halaman ini tidak ada/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Kembali ke beranda/i })).toBeVisible();
    expect(response?.status()).toBe(404);
  });

  test("keyboard focus produces a visible ring", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        visible: el.matches(":focus-visible"),
        width: cs.outlineWidth,
        style: cs.outlineStyle,
      };
    });

    expect(focus?.visible).toBe(true);
    expect(focus?.style).not.toBe("none");
    expect(parseFloat(focus?.width ?? "0")).toBeGreaterThan(0);
  });
});

test.describe("Mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile menu only exists below md");

  test("menu opens, navigates, and closes itself", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /menu/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.locator("header nav").last().getByRole("link", { name: "Processing" }).click();
    await expect(page).toHaveURL(/\/processing$/);

    // Route change must close the panel, or the user taps through an overlay.
    await expect(page.getByRole("button", { name: /menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});

import type { Locator, Page } from "@playwright/test";

/**
 * Page Object for the Web Profile route (`/`).
 *
 * Locators are role/text based rather than CSS-class based so a restyle does not
 * break the suite — the design system was rewritten once already this project.
 */
export class ProfilePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/");
  }

  get heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  /** Section bands are addressed by their anchor id, which doubles as the nav target. */
  section(id: string): Locator {
    return this.page.locator(`section#${id}`);
  }

  get allSectionIds(): Promise<string[]> {
    return this.page
      .locator("section[id]")
      .evaluateAll((els) => els.map((e) => e.id).filter(Boolean));
  }

  get publicationsLink(): Locator {
    return this.page.getByRole("link", { name: "Lihat publikasi" });
  }

  get workbenchCta(): Locator {
    return this.page.getByRole("link", { name: /Coba alur kerja pemetaan/i });
  }

  get contactForm(): Locator {
    return this.page.locator("form");
  }

  get submitButton(): Locator {
    return this.page.getByRole("button", { name: "Kirim pesan" });
  }

  field(label: string): Locator {
    return this.contactForm.getByLabel(label);
  }

  /** Dev-only banner that appears when the spreadsheet was not used. */
  get fallbackNotice(): Locator {
    return this.page.getByText("Konten fallback", { exact: false });
  }

  get footer(): Locator {
    return this.page.locator("footer");
  }
}

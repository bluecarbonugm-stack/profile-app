import type { Locator, Page } from "@playwright/test";

/**
 * Page Object for the Web Processing workbench (`/processing`).
 *
 * The workbench is desktop-only (`lg:` breakpoint) and mounts React Flow after
 * hydration, so every accessor here assumes a desktop viewport.
 */
export class WorkbenchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/processing");
  }

  /** Waits for the lazy-loaded canvas rather than an arbitrary timeout. */
  async waitForCanvas() {
    await this.page.locator(".react-flow").waitFor({ state: "visible" });
  }

  get narrowScreenNotice(): Locator {
    return this.page.getByRole("heading", { name: /layar lebih lebar/i });
  }

  get emptyCanvasHint(): Locator {
    return this.page.getByText(/Tarik node dari palette/i);
  }

  get nodes(): Locator {
    return this.page.locator(".react-flow__node");
  }

  get paletteSearch(): Locator {
    return this.page.getByRole("searchbox", { name: "Cari node" });
  }

  paletteCategory(code: string): Locator {
    return this.page.getByRole("button").filter({ hasText: new RegExp(`^${code}`) });
  }

  toolbarButton(name: string): Locator {
    return this.page.getByRole("button", { name, exact: true });
  }

  get templateMenuItems(): Locator {
    return this.page.getByRole("menuitem");
  }

  get propertyPanel(): Locator {
    return this.page.locator("aside").last();
  }

  get propertyPanelPlaceholder(): Locator {
    return this.page.getByText(/Pilih sebuah node di kanvas/i);
  }

  get consoleEntries(): Locator {
    return this.page.locator("section ol li");
  }

  /** Sonner renders toasts into a live region. */
  toast(text: string | RegExp): Locator {
    return this.page.locator("[data-sonner-toast]").filter({ hasText: text });
  }

  async loadFirstTemplate() {
    await this.toolbarButton("Template").click();
    await this.templateMenuItems.first().click();
  }

  get canvasDropTarget(): Locator {
    return this.page.locator(".workbench");
  }

  paletteNode(name: string): Locator {
    return this.page.locator('[draggable="true"]').filter({ hasText: name });
  }

  /** Real HTML5 drag-and-drop needs an in-page DataTransfer shared across events. */
  async dragNodeToCanvas(name: string) {
    const source = this.paletteNode(name);
    const target = this.canvasDropTarget;
    const box = await target.boundingBox();
    const position = box ? { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 } : {};
    const dataTransfer = await this.page.evaluateHandle(() => new DataTransfer());
    await source.dispatchEvent("dragstart", { dataTransfer });
    await target.dispatchEvent("dragover", { dataTransfer, ...position });
    await target.dispatchEvent("drop", { dataTransfer, ...position });
  }

  /** Uploads a file into the currently-selected node's file param in the property panel. */
  async uploadNodeFile(filePath: string) {
    await this.propertyPanel.locator("input[type=file]").setInputFiles(filePath);
  }
}

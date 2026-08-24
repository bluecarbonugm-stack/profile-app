import path from "node:path";

import { expect, test } from "@playwright/test";

import { WorkbenchPage } from "./pages/workbench.page";

const SAMPLE_TABLE_CSV = path.join(import.meta.dirname, "fixtures/sample-table.csv");

// The workbench is gated behind the `lg:` breakpoint, so the mobile project can
// only assert the notice. Desktop-only specs are scoped explicitly.
test.describe("Web Processing — desktop", () => {
  test.skip(({ isMobile }) => !!isMobile, "workbench requires a >=1024px viewport");

  test("mounts the canvas with an empty state", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();

    await expect(wb.emptyCanvasHint).toBeVisible();
    await expect(wb.nodes).toHaveCount(0);
    await expect(wb.propertyPanelPlaceholder).toBeVisible();
  });

  test("empty-state hint does not block the drop target", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();

    // If this ever becomes anything but "none", drag-and-drop silently breaks.
    const pointerEvents = await page
      .locator("div.pointer-events-none")
      .first()
      .evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents).toBe("none");
  });

  test("loading a template populates nodes and edges", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();

    await wb.loadFirstTemplate();

    await expect(wb.nodes.first()).toBeVisible();
    expect(await wb.nodes.count()).toBeGreaterThan(1);
    await expect(wb.emptyCanvasHint).toBeHidden();

    // Edges are the part that renders only once React Flow has measured the
    // handles — the exact thing that could not be confirmed manually.
    await expect(page.locator(".react-flow__edge")).not.toHaveCount(0);
  });

  test("selecting a node populates the property panel", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();
    await wb.loadFirstTemplate();

    await wb.nodes.first().click();

    await expect(wb.propertyPanelPlaceholder).toBeHidden();
    // Category label must be the human-readable one, not the raw catalog id.
    await expect(wb.propertyPanel).toContainText("·");
    await expect(wb.propertyPanel).not.toContainText("preproc");
  });

  test("editing a parameter persists in the node data", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();
    await wb.loadFirstTemplate();
    await wb.nodes.first().click();

    const firstInput = wb.propertyPanel.locator("input[type=text]").first();
    await firstInput.fill("uji_e2e.tif");

    // Deselect and reselect: the value must survive a panel remount.
    await page.locator(".react-flow__pane").click({ position: { x: 5, y: 5 } });
    await expect(wb.propertyPanelPlaceholder).toBeVisible();
    await wb.nodes.first().click();
    await expect(wb.propertyPanel.locator("input[type=text]").first()).toHaveValue("uji_e2e.tif");
  });

  test("running the pipeline logs every node to the console", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();
    await wb.loadFirstTemplate();

    const nodeCount = await wb.nodes.count();
    await wb.toolbarButton("Run All").click();

    await expect(page.getByText("✓ Pipeline selesai.")).toBeVisible({ timeout: 30_000 });
    // One "Running…" + one result line per node, plus start and finish lines.
    expect(await wb.consoleEntries.count()).toBeGreaterThanOrEqual(nodeCount * 2);
  });

  test("uploading a real file and running it produces a real row count", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();

    await wb.dragNodeToCanvas("Muat Tabel");
    await expect(wb.nodes).toHaveCount(1);

    await wb.nodes.first().click();
    await wb.uploadNodeFile(SAMPLE_TABLE_CSV);
    // Confirms the artifact upload round-trip finished before we run the graph.
    await expect(wb.propertyPanel.getByText(/File terunggah/i)).toBeVisible();

    await wb.toolbarButton("Run All").click();
    await expect(page.getByText("✓ Pipeline selesai.")).toBeVisible({ timeout: 30_000 });

    // Real execution reports the fixture's actual row count, not the old
    // hardcoded/simulated accuracy figures other node previews use.
    await wb.nodes.first().dblclick();
    await expect(page.getByText("rowCount")).toBeVisible();
    await expect(page.getByRole("row", { name: /rowCount\s*3/ })).toBeVisible();
  });

  test("save then load round-trips the workflow through localStorage", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();
    await wb.loadFirstTemplate();

    const saved = await wb.nodes.count();
    await wb.toolbarButton("Save").click();

    await wb.toolbarButton("Clear").click();
    await expect(wb.nodes).toHaveCount(0);

    await wb.toolbarButton("Load").click();
    await expect(wb.nodes).toHaveCount(saved);
  });

  test("palette search filters nodes and reports no matches", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();

    await wb.paletteSearch.fill("sunglint");
    await expect(page.getByText("Sunglint", { exact: false }).first()).toBeVisible();

    await wb.paletteSearch.fill("zzzz-tidak-ada");
    await expect(page.getByText(/Tidak ada node yang cocok/i)).toBeVisible();
  });

  test("no console errors while driving the workbench", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    const wb = new WorkbenchPage(page);
    await wb.goto();
    await wb.waitForCanvas();
    await wb.loadFirstTemplate();
    await wb.nodes.first().click();

    expect(errors).toEqual([]);
  });
});

test.describe("Web Processing — mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "covers the narrow-screen path only");

  test("shows the narrow-screen notice instead of the canvas", async ({ page }) => {
    const wb = new WorkbenchPage(page);
    await wb.goto();

    await expect(wb.narrowScreenNotice).toBeVisible();
    await expect(page.locator(".react-flow")).toBeHidden();
  });
});

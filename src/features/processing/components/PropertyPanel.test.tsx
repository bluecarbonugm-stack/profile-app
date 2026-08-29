import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Node } from "@xyflow/react";

import { PropertyPanel } from "./PropertyPanel";
import type { WorkbenchNodeData } from "./WorkbenchNode";

const node = (specId: string, samplePoints: Array<{ lat: number; lon: number }> = []): Node => ({
  id: "n1",
  type: "workbench",
  position: { x: 0, y: 0 },
  data: {
    specId,
    params: { sample_points: samplePoints },
  } satisfies WorkbenchNodeData,
});

describe("PropertyPanel ROI point editor", () => {
  it("renders minimum-10 ROI validation for sample point nodes", () => {
    const html = renderToStaticMarkup(
      <PropertyPanel node={node("sunglint")} onParamChange={() => undefined} />,
    );

    expect(html).toContain("ROI Points");
    expect(html).toContain("0 / min 10");
    expect(html).toContain("Perlu minimal 10 titik");
  });

  it("keeps ROI editor hidden for non ROI nodes", () => {
    const html = renderToStaticMarkup(
      <PropertyPanel node={node("raster-input")} onParamChange={() => undefined} />,
    );

    expect(html).not.toContain("ROI Points");
  });
});

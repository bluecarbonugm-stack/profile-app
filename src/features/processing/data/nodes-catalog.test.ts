import { describe, expect, it } from "vitest";
import { NODES_BY_ID } from "./nodes-catalog";

describe("catalog <-> backend param contracts", () => {
  it("sunglint sends keys the Hedley executor reads", () => {
    const keys = NODES_BY_ID.sunglint.params.map((p) => p.key);
    expect(keys).toEqual(expect.arrayContaining(["nir_band", "visible_bands", "sample_points"]));
    const sp = NODES_BY_ID.sunglint.params.find((p) => p.key === "sample_points");
    expect(Array.isArray(sp?.default)).toBe(true);
  });

  it("water-column sends keys the Lyzenga executor reads", () => {
    const keys = NODES_BY_ID["water-column"].params.map((p) => p.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "blue_band",
        "green_band",
        "red_band",
        "inverse_transform",
        "sample_points",
      ]),
    );
  });

  it("rf-train outputs classified raster as its first output", () => {
    const spec = NODES_BY_ID["rf-train"];
    expect(spec.outputs[0].type).toBe("raster");
  });

  it("rf-train labels port is vector and exposes required params", () => {
    const spec = NODES_BY_ID["rf-train"];
    const labels = spec.inputs.find((i) => i.id === "labels");
    expect(labels?.type).toBe("vector");
    const keys = spec.params.map((p) => p.key);
    expect(keys).toEqual(expect.arrayContaining(["label_field", "n_estimators", "max_depth"]));
  });

  it("ROI sample_points default is an array, not a legacy string", () => {
    for (const id of ["sunglint", "water-column"]) {
      const p = NODES_BY_ID[id].params.find((x) => x.key === "sample_points");
      expect(Array.isArray(p?.default)).toBe(true);
    }
  });
});

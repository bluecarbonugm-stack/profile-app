import { describe, expect, it } from "vitest";
import { topoSort } from "./topo-sort";

describe("topoSort", () => {
  it("orders a linear chain", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ];
    expect(topoSort(nodes, edges)).toEqual({ ok: true, order: ["a", "b", "c"] });
  });

  it("orders a branching graph consistently with all edges", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];
    const result = topoSort(nodes, edges);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.indexOf("a")).toBeLessThan(result.order.indexOf("b"));
      expect(result.order.indexOf("a")).toBeLessThan(result.order.indexOf("c"));
      expect(result.order.indexOf("b")).toBeLessThan(result.order.indexOf("d"));
      expect(result.order.indexOf("c")).toBeLessThan(result.order.indexOf("d"));
    }
  });

  it("detects a two-node cycle", () => {
    const nodes = [{ id: "a" }, { id: "b" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "a" },
    ];
    const result = topoSort(nodes, edges);
    expect(result.ok).toBe(false);
  });

  it("handles nodes with no edges", () => {
    expect(topoSort([{ id: "a" }], [])).toEqual({ ok: true, order: ["a"] });
  });

  it("handles an empty graph", () => {
    expect(topoSort([], [])).toEqual({ ok: true, order: [] });
  });
});

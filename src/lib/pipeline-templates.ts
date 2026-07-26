// Preset pipelines that can be loaded into the workbench canvas.
// Each entry defines nodes (spec ids + positions) and edges (source→target port).

export interface TemplateNode {
  id: string;
  specId: string;
  x: number;
  y: number;
}

export interface TemplateEdge {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

const step = 260;
const row = (i: number) => 80 + i * 120;

export const TEMPLATES: PipelineTemplate[] = [
  {
    id: "preproc",
    name: "Pra-pemrosesan Citra Perairan Dangkal",
    description: "Sunglint → Ln → Kolom Air → Stack → Mask → Export.",
    nodes: [
      { id: "n1", specId: "raster-input", x: 40, y: row(0) },
      { id: "n2", specId: "roi-sampling", x: 40 + step, y: row(-1) },
      { id: "n3", specId: "sunglint", x: 40 + step * 2, y: row(0) },
      { id: "n4", specId: "ln-transform", x: 40 + step * 3, y: row(0) },
      { id: "n5", specId: "substrate-sampling", x: 40 + step * 3, y: row(1) },
      { id: "n6", specId: "water-column", x: 40 + step * 4, y: row(0) },
      { id: "n7", specId: "band-stack", x: 40 + step * 5, y: row(0) },
      { id: "n8", specId: "masking", x: 40 + step * 6, y: row(0) },
      { id: "n9", specId: "raster-export", x: 40 + step * 7, y: row(0) },
    ],
    edges: [
      { source: "n1", sourceHandle: "out", target: "n2", targetHandle: "in" },
      { source: "n1", sourceHandle: "out", target: "n3", targetHandle: "raster" },
      { source: "n2", sourceHandle: "out", target: "n3", targetHandle: "roi" },
      { source: "n3", sourceHandle: "out", target: "n4", targetHandle: "in" },
      { source: "n4", sourceHandle: "out", target: "n5", targetHandle: "in" },
      { source: "n4", sourceHandle: "out", target: "n6", targetHandle: "raster" },
      { source: "n5", sourceHandle: "out", target: "n6", targetHandle: "substrate" },
      { source: "n3", sourceHandle: "out", target: "n7", targetHandle: "a" },
      { source: "n6", sourceHandle: "out", target: "n7", targetHandle: "b" },
      { source: "n7", sourceHandle: "out", target: "n8", targetHandle: "raster" },
      { source: "n8", sourceHandle: "out", target: "n9", targetHandle: "in" },
    ],
  },
  {
    id: "field-integration",
    name: "Integrasi Data Lapangan dengan Resolusi Citra",
    description: "Fishnet → Spatial Join → Feature to Point → Export.",
    nodes: [
      { id: "n1", specId: "raster-input", x: 40, y: row(0) },
      { id: "n2", specId: "vector-input", x: 40, y: row(1) },
      { id: "n3", specId: "fishnet", x: 40 + step, y: row(0) },
      { id: "n4", specId: "spatial-join", x: 40 + step * 2, y: row(0) },
      { id: "n5", specId: "feature-to-point", x: 40 + step * 3, y: row(0) },
      { id: "n6", specId: "vector-export", x: 40 + step * 4, y: row(0) },
    ],
    edges: [
      { source: "n1", sourceHandle: "out", target: "n3", targetHandle: "raster" },
      { source: "n3", sourceHandle: "out", target: "n4", targetHandle: "grid" },
      { source: "n2", sourceHandle: "out", target: "n4", targetHandle: "points" },
      { source: "n4", sourceHandle: "out", target: "n5", targetHandle: "in" },
      { source: "n5", sourceHandle: "out", target: "n6", targetHandle: "in" },
    ],
  },
  {
    id: "rf-classification",
    name: "Klasifikasi Random Forest & Uji Akurasi",
    description: "Split → Rasterize → RF Train → Classify → Confusion Matrix.",
    nodes: [
      { id: "n1", specId: "raster-input", x: 40, y: row(0) },
      { id: "n2", specId: "vector-input", x: 40, y: row(2) },
      { id: "n3", specId: "train-test-split", x: 40 + step, y: row(2) },
      { id: "n4", specId: "rasterize", x: 40 + step * 2, y: row(1) },
      { id: "n5", specId: "rasterize", x: 40 + step * 2, y: row(3) },
      { id: "n6", specId: "rf-train", x: 40 + step * 3, y: row(0) },
      { id: "n7", specId: "classify-image", x: 40 + step * 4, y: row(0) },
      { id: "n8", specId: "confusion-matrix", x: 40 + step * 5, y: row(2) },
    ],
    edges: [
      { source: "n2", sourceHandle: "out", target: "n3", targetHandle: "in" },
      { source: "n3", sourceHandle: "train", target: "n4", targetHandle: "vector" },
      { source: "n1", sourceHandle: "out", target: "n4", targetHandle: "ref" },
      { source: "n3", sourceHandle: "test", target: "n5", targetHandle: "vector" },
      { source: "n1", sourceHandle: "out", target: "n5", targetHandle: "ref" },
      { source: "n1", sourceHandle: "out", target: "n6", targetHandle: "image" },
      { source: "n4", sourceHandle: "out", target: "n6", targetHandle: "labels" },
      { source: "n1", sourceHandle: "out", target: "n7", targetHandle: "image" },
      { source: "n6", sourceHandle: "model", target: "n7", targetHandle: "model" },
      { source: "n7", sourceHandle: "out", target: "n8", targetHandle: "pred" },
      { source: "n5", sourceHandle: "out", target: "n8", targetHandle: "truth" },
    ],
  },
  {
    id: "multitemporal",
    name: "Analisis Multi-Temporal",
    description: "Peta A + B → Poligon → Overlay → Change → Time-series.",
    nodes: [
      { id: "n1", specId: "raster-input", x: 40, y: row(0) },
      { id: "n2", specId: "raster-input", x: 40, y: row(2) },
      { id: "n3", specId: "raster-to-polygon", x: 40 + step, y: row(0) },
      { id: "n4", specId: "raster-to-polygon", x: 40 + step, y: row(2) },
      { id: "n5", specId: "filter-attr", x: 40 + step * 2, y: row(0) },
      { id: "n6", specId: "filter-attr", x: 40 + step * 2, y: row(2) },
      { id: "n7", specId: "overlay", x: 40 + step * 3, y: row(1) },
      { id: "n8", specId: "change-field", x: 40 + step * 4, y: row(1) },
      { id: "n9", specId: "change-symbolizer", x: 40 + step * 5, y: row(0) },
      { id: "n10", specId: "area-summary", x: 40 + step * 5, y: row(2) },
      { id: "n11", specId: "timeseries-chart", x: 40 + step * 6, y: row(2) },
    ],
    edges: [
      { source: "n1", sourceHandle: "out", target: "n3", targetHandle: "in" },
      { source: "n2", sourceHandle: "out", target: "n4", targetHandle: "in" },
      { source: "n3", sourceHandle: "out", target: "n5", targetHandle: "in" },
      { source: "n4", sourceHandle: "out", target: "n6", targetHandle: "in" },
      { source: "n5", sourceHandle: "out", target: "n7", targetHandle: "a" },
      { source: "n6", sourceHandle: "out", target: "n7", targetHandle: "b" },
      { source: "n7", sourceHandle: "out", target: "n8", targetHandle: "in" },
      { source: "n8", sourceHandle: "out", target: "n9", targetHandle: "in" },
      { source: "n8", sourceHandle: "out", target: "n10", targetHandle: "in" },
      { source: "n10", sourceHandle: "table", target: "n11", targetHandle: "in" },
    ],
  },
];

// Node catalog for the Blue Carbon Processing Workbench.
// Structure mirrors CONTEXT.md sections A–G. Kept as data so the palette,
// property panel, and default-node factory all read from a single source.

export type PortType = "raster" | "vector" | "table" | "model" | "chart" | "any";

export interface Port {
  id: string;
  label: string;
  type: PortType;
}

export type ParamType = "text" | "number" | "select" | "checkbox" | "file";

export interface Param {
  key: string;
  label: string;
  type: ParamType;
  default?: string | number | boolean;
  options?: string[];
  help?: string;
  accept?: string;
}

export interface NodeSpec {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  inputs: Port[];
  outputs: Port[];
  params: Param[];
}

export type CategoryId = "io" | "preproc" | "field" | "ml" | "accuracy" | "temporal" | "utility";

export interface Category {
  id: CategoryId;
  code: string;
  label: string;
  hint: string;
}

export const CATEGORIES: Category[] = [
  { id: "io", code: "A", label: "Data I/O", hint: "Input / output raster, vektor, tabel" },
  {
    id: "preproc",
    code: "B",
    label: "Pra-Pemrosesan Citra",
    hint: "Koreksi atmosfer, sunglint, kolom air",
  },
  {
    id: "field",
    code: "C",
    label: "Data Lapangan & Integrasi",
    hint: "Fishnet, spatial join, skema kelas",
  },
  { id: "ml", code: "D", label: "Klasifikasi & ML", hint: "Random Forest, classify image" },
  { id: "accuracy", code: "E", label: "Uji Akurasi", hint: "Confusion matrix, fast accuracy" },
  { id: "temporal", code: "F", label: "Analisis Multi-Temporal", hint: "Overlay, perubahan, tren" },
  { id: "utility", code: "G", label: "Utilitas & Visualisasi", hint: "Reproject, preview, report" },
];

export const PORT_COLORS: Record<PortType, string> = {
  raster: "var(--port-raster)",
  vector: "var(--port-vector)",
  table: "var(--port-table)",
  model: "var(--port-model)",
  chart: "var(--port-chart)",
  any: "var(--muted-foreground)",
};

const p = (id: string, label: string, type: PortType): Port => ({ id, label, type });

export const NODES: NodeSpec[] = [
  // ===== A. Data I/O =====
  {
    id: "raster-input",
    name: "Raster Input",
    category: "io",
    description: "Muat citra multi-band (GeoTIFF/Sentinel-2) sebagai titik awal pipeline.",
    inputs: [],
    outputs: [p("out", "Raster", "raster")],
    params: [
      {
        key: "file",
        label: "File raster",
        type: "file",
        accept: ".tif,.tiff",
        help: "Contoh: S2_karimunjawa_20220710.tif",
      },
      { key: "crs", label: "CRS", type: "text", default: "EPSG:32749" },
      { key: "bands", label: "Nama band (comma)", type: "text", default: "B2,B3,B4,B8" },
    ],
  },
  {
    id: "vector-input",
    name: "Vector Input (SHP)",
    category: "io",
    description: "Muat shapefile titik/garis/poligon (sampel, batas kajian, grid).",
    inputs: [],
    outputs: [p("out", "Vector", "vector")],
    params: [
      {
        key: "file",
        label: "File shapefile",
        type: "file",
        accept: ".shp,.geojson,.json",
        help: "Contoh: sampel_lapangan.shp",
      },
      { key: "crs", label: "CRS", type: "text", default: "EPSG:32749" },
    ],
  },
  {
    id: "table-input",
    name: "Muat Tabel",
    category: "io",
    description: "Membaca berkas tabel (CSV/XLSX) untuk digunakan sebagai data lapangan.",
    inputs: [],
    outputs: [p("table", "Tabel", "table")],
    params: [
      {
        key: "file",
        label: "File",
        type: "file",
        accept: ".csv,.xlsx",
        help: "Contoh: data_lapangan.csv",
      },
    ],
  },
  {
    id: "train-test-split",
    name: "Definisi Field Train/Test",
    category: "io",
    description: "Split sampel berlabel menjadi data training & validasi.",
    inputs: [p("in", "Vector berlabel", "vector")],
    outputs: [p("train", "Train", "vector"), p("test", "Test", "vector")],
    params: [
      { key: "labelField", label: "Field kelas", type: "text", default: "Class" },
      { key: "ratio", label: "Rasio train (%)", type: "number", default: 70 },
      {
        key: "mode",
        label: "Mode split",
        type: "select",
        options: ["Acak", "Stratified per kelas"],
        default: "Stratified per kelas",
      },
      { key: "seed", label: "Random seed", type: "number", default: 42 },
    ],
  },
  {
    id: "raster-export",
    name: "Raster Export",
    category: "io",
    description: "Simpan hasil raster ke file (GeoTIFF).",
    inputs: [p("in", "Raster", "raster")],
    outputs: [],
    params: [
      {
        key: "format",
        label: "Format",
        type: "select",
        options: ["GeoTIFF", "COG", "IMG"],
        default: "GeoTIFF",
      },
      {
        key: "compress",
        label: "Kompresi",
        type: "select",
        options: ["LZW", "DEFLATE", "None"],
        default: "LZW",
      },
      { key: "filename", label: "Nama file", type: "text", default: "output.tif" },
    ],
  },
  {
    id: "vector-export",
    name: "Vector Export",
    category: "io",
    description: "Simpan hasil vektor ke SHP/GeoJSON.",
    inputs: [p("in", "Vector", "vector")],
    outputs: [],
    params: [
      {
        key: "format",
        label: "Format",
        type: "select",
        options: ["Shapefile", "GeoJSON", "GeoPackage"],
        default: "Shapefile",
      },
      { key: "filename", label: "Nama file", type: "text", default: "output.shp" },
    ],
  },
  {
    id: "table-export",
    name: "Table Export",
    category: "io",
    description: "Simpan tabel atribut / akurasi ke CSV/XLSX.",
    inputs: [p("in", "Table", "table")],
    outputs: [],
    params: [
      { key: "format", label: "Format", type: "select", options: ["CSV", "XLSX"], default: "CSV" },
      { key: "filename", label: "Nama file", type: "text", default: "output.csv" },
    ],
  },

  // ===== B. Pra-Pemrosesan Citra =====
  {
    id: "atmos-correction",
    name: "Koreksi Atmosfer",
    category: "preproc",
    description: "Placeholder/pass-through: citra L2/L2A umumnya sudah terkoreksi atmosfer.",
    inputs: [p("in", "Raster", "raster")],
    outputs: [p("out", "Raster", "raster")],
    params: [
      {
        key: "method",
        label: "Metode",
        type: "select",
        options: ["DOS", "COST", "QUAC", "FLAASH", "Pass-through (L2A)"],
        default: "Pass-through (L2A)",
      },
    ],
  },
  {
    id: "roi-sampling",
    name: "Sampling ROI",
    category: "preproc",
    description: "Mengambil sampel piksel (sunglint, substrat) untuk regresi koreksi.",
    inputs: [p("in", "Raster", "raster")],
    outputs: [p("out", "Sampel", "vector")],
    params: [
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: ["Manual (klik canvas)", "Grid acak"],
        default: "Grid acak",
      },
      { key: "nSamples", label: "Jumlah sampel", type: "number", default: 200 },
      { key: "label", label: "Label ROI", type: "text", default: "Sunglint" },
    ],
  },
  {
    id: "sunglint",
    name: "Koreksi Sunglint (Hedley)",
    category: "preproc",
    description: "Regresi band visible terhadap NIR untuk menghilangkan glint permukaan air.",
    inputs: [p("raster", "Raster", "raster"), p("roi", "ROI sunglint", "vector")],
    outputs: [p("out", "Raster ter-deglint", "raster"), p("chart", "Regresi R²", "chart")],
    params: [
      { key: "nir", label: "Band NIR", type: "text", default: "B8" },
      { key: "visible", label: "Band visible", type: "text", default: "B2,B3,B4" },
      {
        key: "regression",
        label: "Metode regresi",
        type: "select",
        options: ["OLS", "Robust"],
        default: "OLS",
      },
    ],
  },
  {
    id: "ln-transform",
    name: "Ln Transform",
    category: "preproc",
    description: "Transformasi logaritma natural (persiapan koreksi kolom air Lyzenga).",
    inputs: [p("in", "Raster", "raster")],
    outputs: [p("out", "Raster (ln)", "raster")],
    params: [
      { key: "bands", label: "Band yang ditransformasi", type: "text", default: "B2,B3,B4" },
    ],
  },
  {
    id: "substrate-sampling",
    name: "Sampling Substrat Acuan",
    category: "preproc",
    description: "Ambil sampel substrat homogen (mis. pasir) di berbagai kedalaman.",
    inputs: [p("in", "Raster (ln)", "raster")],
    outputs: [p("out", "Sampel substrat", "vector")],
    params: [
      { key: "nSamples", label: "Jumlah sampel", type: "number", default: 150 },
      { key: "label", label: "Label substrat", type: "text", default: "Pasir" },
    ],
  },
  {
    id: "water-column",
    name: "Koreksi Kolom Air (DII)",
    category: "preproc",
    description: "Depth-Invariant Index: kombinasi pasangan band untuk hilangkan efek kedalaman.",
    inputs: [p("raster", "Raster (ln)", "raster"), p("substrate", "Sampel substrat", "vector")],
    outputs: [p("out", "Raster DII", "raster"), p("chart", "Regresi ki/kj", "chart")],
    params: [
      { key: "pairs", label: "Pasangan band", type: "text", default: "B2-B3, B2-B4, B3-B4" },
    ],
  },
  {
    id: "band-stack",
    name: "Band Stack / Komposit",
    category: "preproc",
    description: "Gabung band hasil koreksi menjadi citra multi-band siap klasifikasi.",
    inputs: [p("a", "Raster A", "raster"), p("b", "Raster B", "raster")],
    outputs: [p("out", "Raster multi-band", "raster")],
    params: [
      {
        key: "order",
        label: "Urutan band",
        type: "text",
        default: "B2,B3,B4,DII_B2B3,DII_B2B4,DII_B3B4",
      },
    ],
  },
  {
    id: "masking",
    name: "Masking (Batas Kajian)",
    category: "preproc",
    description: "Batasi analisis ke area laut dangkal optis, buang NoData/daratan.",
    inputs: [p("raster", "Raster", "raster"), p("mask", "Vector batas", "vector")],
    outputs: [p("out", "Raster termasking", "raster")],
    params: [
      {
        key: "source",
        label: "Sumber mask",
        type: "select",
        options: ["Vector batas", "Threshold NoData"],
        default: "Vector batas",
      },
      { key: "invert", label: "Invert mask", type: "checkbox", default: false },
    ],
  },
  {
    id: "clip",
    name: "Clip / Crop Raster",
    category: "preproc",
    description: "Potong citra sesuai batas extent.",
    inputs: [p("raster", "Raster", "raster"), p("extent", "Vector extent", "vector")],
    outputs: [p("out", "Raster clip", "raster")],
    params: [],
  },

  // ===== C. Field & Integrasi =====
  {
    id: "field-import",
    name: "Impor Data Survei Lapangan",
    category: "field",
    description: "Konversi hasil photo-quadrate/transect/CPCe menjadi titik spasial.",
    inputs: [p("table", "Tabel survei", "table")],
    outputs: [p("out", "Titik lapangan", "vector")],
    params: [
      {
        key: "method",
        label: "Metode survei",
        type: "select",
        options: ["Photo-quadrate", "Photo-transect", "CPCe"],
        default: "Photo-transect",
      },
      { key: "xField", label: "Field X (lon)", type: "text", default: "lon" },
      { key: "yField", label: "Field Y (lat)", type: "text", default: "lat" },
    ],
  },
  {
    id: "fishnet",
    name: "Fishnet Grid Generator",
    category: "field",
    description: "Buat grid poligon selaras resolusi piksel citra.",
    inputs: [p("raster", "Raster acuan", "raster")],
    outputs: [p("out", "Grid", "vector")],
    params: [{ key: "cellSize", label: "Ukuran sel (m)", type: "number", default: 10 }],
  },
  {
    id: "spatial-join",
    name: "Spatial Join (ke Grid)",
    category: "field",
    description: "Agregasi titik lapangan ke grid (mean/majority).",
    inputs: [p("grid", "Grid", "vector"), p("points", "Titik lapangan", "vector")],
    outputs: [p("out", "Grid agregasi", "vector")],
    params: [
      {
        key: "rule",
        label: "Aturan agregasi",
        type: "select",
        options: ["Mean", "Sum", "Majority"],
        default: "Mean",
      },
      {
        key: "overlap",
        label: "Overlap",
        type: "select",
        options: ["contains", "intersect"],
        default: "intersect",
      },
      {
        key: "join",
        label: "Kardinalitas",
        type: "select",
        options: ["one-to-one", "one-to-many"],
        default: "one-to-one",
      },
    ],
  },
  {
    id: "feature-to-point",
    name: "Feature to Point (Centroid)",
    category: "field",
    description: "Konversi grid poligon menjadi titik centroid representatif.",
    inputs: [p("in", "Grid poligon", "vector")],
    outputs: [p("out", "Titik", "vector")],
    params: [],
  },
  {
    id: "classification-scheme",
    name: "Definisi Skema Klasifikasi",
    category: "field",
    description: "Definisikan skema kelas mayor/detail (Terumbu, Lamun, Makroalga, Substrat...).",
    inputs: [],
    outputs: [p("out", "Skema", "table")],
    params: [
      {
        key: "level",
        label: "Level skema",
        type: "select",
        options: ["Mayor", "Detail"],
        default: "Mayor",
      },
      {
        key: "classes",
        label: "Daftar kelas",
        type: "text",
        default: "Terumbu Karang, Lamun, Makroalga, Substrat Terbuka",
      },
      { key: "rule", label: "Rule dominasi", type: "text", default: "±70% dominan, ±30% campuran" },
    ],
  },
  {
    id: "label-class",
    name: "Pelabelan Kelas",
    category: "field",
    description: "Tambahkan field kelas pada sampel sesuai skema.",
    inputs: [p("points", "Titik sampel", "vector"), p("scheme", "Skema", "table")],
    outputs: [p("out", "Titik berlabel", "vector")],
    params: [
      { key: "target", label: "Field tujuan", type: "text", default: "Class" },
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: ["Otomatis (rule)", "Manual"],
        default: "Otomatis (rule)",
      },
    ],
  },
  {
    id: "field-calculator",
    name: "Field Calculator",
    category: "field",
    description: "Ekspresi atribut umum (konkat, aritmatika, kondisional).",
    inputs: [p("in", "Table/Vector", "any")],
    outputs: [p("out", "Table/Vector", "any")],
    params: [
      { key: "field", label: "Field tujuan", type: "text", default: "change_label" },
      { key: "expr", label: "Ekspresi", type: "text", default: "concat(class_A, ' → ', class_B)" },
    ],
  },

  // ===== D. Klasifikasi & ML =====
  {
    id: "rasterize",
    name: "Rasterize Vektor",
    category: "ml",
    description: "Konversi sampel vektor berlabel ke raster (selaras citra).",
    inputs: [p("vector", "Vector berlabel", "vector"), p("ref", "Raster acuan", "raster")],
    outputs: [p("out", "Raster kelas", "raster")],
    params: [{ key: "field", label: "Field kelas", type: "text", default: "Class" }],
  },
  {
    id: "rf-train",
    name: "Random Forest: Train Model",
    category: "ml",
    description: "Latih model Random Forest dari citra + sampel training.",
    inputs: [p("image", "Citra", "raster"), p("labels", "Raster sampel training", "raster")],
    outputs: [
      p("model", "Model RF", "model"),
      p("importance", "Variable importance", "chart"),
      p("oob", "OOB report", "chart"),
    ],
    params: [
      {
        key: "nTree",
        label: "nTree",
        type: "select",
        options: ["50", "100", "200", "300", "500"],
        default: "300",
      },
      {
        key: "vars",
        label: "Pemilihan variabel",
        type: "select",
        options: ["sqrt", "log"],
        default: "sqrt",
      },
      {
        key: "impurity",
        label: "Fungsi impurity",
        type: "select",
        options: ["Gini", "Entropy"],
        default: "Gini",
      },
      { key: "grid", label: "Uji semua kombinasi", type: "checkbox", default: false },
    ],
  },
  {
    id: "classify-image",
    name: "Classify Image (Apply Model)",
    category: "ml",
    description: "Terapkan model RF ke seluruh citra (dalam batas mask).",
    inputs: [
      p("image", "Citra", "raster"),
      p("model", "Model RF", "model"),
      p("mask", "Mask (opsional)", "raster"),
    ],
    outputs: [p("out", "Peta klasifikasi", "raster")],
    params: [],
  },
  {
    id: "var-importance",
    name: "Variable Importance Viewer",
    category: "ml",
    description: "Tampilkan peringkat kontribusi tiap band terhadap model.",
    inputs: [p("model", "Model RF", "model")],
    outputs: [p("chart", "Chart", "chart")],
    params: [],
  },

  // ===== E. Uji Akurasi =====
  {
    id: "confusion-matrix",
    name: "Confusion Matrix / Accuracy",
    category: "accuracy",
    description: "Hitung user's / producer's / overall accuracy per kelas.",
    inputs: [
      p("pred", "Peta klasifikasi", "raster"),
      p("truth", "Raster sampel validasi", "raster"),
    ],
    outputs: [p("table", "Matriks", "table"), p("report", "Report akurasi", "chart")],
    params: [],
  },
  {
    id: "fast-accuracy",
    name: "Fast Accuracy Assessment",
    category: "accuracy",
    description: "Uji akurasi langsung dari model (tanpa Classify Image).",
    inputs: [
      p("model", "Model RF", "model"),
      p("image", "Citra", "raster"),
      p("truth", "Raster validasi", "raster"),
    ],
    outputs: [p("table", "Matriks", "table"), p("report", "Report", "chart")],
    params: [],
  },

  // ===== F. Analisis Multi-Temporal =====
  {
    id: "raster-to-polygon",
    name: "Raster to Polygon",
    category: "temporal",
    description: "Konversi peta klasifikasi raster menjadi poligon per kelas.",
    inputs: [p("in", "Raster kelas", "raster")],
    outputs: [p("out", "Poligon kelas", "vector")],
    params: [
      { key: "simplify", label: "Simplify polygon", type: "checkbox", default: true },
      { key: "multipart", label: "Multipart feature", type: "checkbox", default: false },
    ],
  },
  {
    id: "filter-attr",
    name: "Filter Atribut",
    category: "temporal",
    description: "Buang poligon unclassified (kode 0) atau area di luar mask.",
    inputs: [p("in", "Vector", "vector")],
    outputs: [p("out", "Vector", "vector")],
    params: [{ key: "expr", label: "Kondisi filter", type: "text", default: "gridcode != 0" }],
  },
  {
    id: "reclassify-label",
    name: "Reklasifikasi Label",
    category: "temporal",
    description: "Mapping kode numerik kelas → nama kelas.",
    inputs: [p("vector", "Vector", "vector"), p("scheme", "Skema", "table")],
    outputs: [p("out", "Vector", "vector")],
    params: [
      {
        key: "map",
        label: "Mapping",
        type: "text",
        default: "1=Terumbu; 2=Lamun; 3=Makroalga; 4=Pasir",
      },
    ],
  },
  {
    id: "area-summary",
    name: "Kalkulasi Luas & Ringkasan",
    category: "temporal",
    description: "Hitung luas per kelas per periode.",
    inputs: [p("in", "Vector", "vector")],
    outputs: [p("table", "Tabel luasan", "table"), p("chart", "Chart", "chart")],
    params: [
      { key: "unit", label: "Satuan", type: "select", options: ["m²", "ha", "km²"], default: "ha" },
      { key: "groupBy", label: "Group by", type: "text", default: "class, periode" },
    ],
  },
  {
    id: "overlay",
    name: "Union / Intersect Overlay",
    category: "temporal",
    description: "Tumpang tindih dua periode untuk deteksi perubahan spasial.",
    inputs: [p("a", "Periode A", "vector"), p("b", "Periode B", "vector")],
    outputs: [p("out", "Vector gabungan", "vector")],
    params: [
      {
        key: "op",
        label: "Operasi",
        type: "select",
        options: ["Union", "Intersect"],
        default: "Intersect",
      },
    ],
  },
  {
    id: "change-field",
    name: "Change Field Builder",
    category: "temporal",
    description: "Bangun field perubahan (mis. 'Lamun → Pasir') & status.",
    inputs: [p("in", "Vector overlay", "vector")],
    outputs: [p("out", "Vector + change", "vector")],
    params: [
      { key: "fieldA", label: "Field kelas A", type: "text", default: "class_A" },
      { key: "fieldB", label: "Field kelas B", type: "text", default: "class_B" },
      { key: "target", label: "Kelas target", type: "text", default: "Lamun" },
    ],
  },
  {
    id: "timeseries-chart",
    name: "Time-Series Chart Builder",
    category: "temporal",
    description: "Grafik tren luasan kelas dari waktu ke waktu.",
    inputs: [p("in", "Tabel luasan", "table")],
    outputs: [p("chart", "Chart", "chart")],
    params: [
      {
        key: "kind",
        label: "Tipe grafik",
        type: "select",
        options: ["Batang", "Garis", "Kombinasi"],
        default: "Garis",
      },
    ],
  },
  {
    id: "change-symbolizer",
    name: "Change Map Symbolizer",
    category: "temporal",
    description: "Peta tematik perubahan (bertambah/berkurang/tetap).",
    inputs: [p("in", "Vector +status", "vector")],
    outputs: [p("out", "Peta tematik", "chart")],
    params: [
      {
        key: "palette",
        label: "Skema warna",
        type: "select",
        options: ["Coral/Teal/Sand", "Diverging RdBu"],
        default: "Coral/Teal/Sand",
      },
    ],
  },

  // ===== G. Utilitas =====
  {
    id: "reproject",
    name: "Reproject / CRS Transform",
    category: "utility",
    description: "Samakan sistem koordinat antar layer.",
    inputs: [p("in", "Raster/Vector", "any")],
    outputs: [p("out", "Raster/Vector", "any")],
    params: [{ key: "crs", label: "CRS tujuan", type: "text", default: "EPSG:32749" }],
  },
  {
    id: "attr-table",
    name: "Attribute Table Viewer",
    category: "utility",
    description: "Tampilkan tabel atribut layer di panel.",
    inputs: [p("in", "Table/Vector", "any")],
    outputs: [],
    params: [],
  },
  {
    id: "map-preview",
    name: "Map Preview",
    category: "utility",
    description: "Pratinjau layer di atas basemap interaktif.",
    inputs: [p("in", "Raster/Vector", "any")],
    outputs: [],
    params: [
      {
        key: "basemap",
        label: "Basemap",
        type: "select",
        options: ["OSM", "Satelit", "Gelap"],
        default: "Satelit",
      },
    ],
  },
  {
    id: "report-generator",
    name: "Report Generator",
    category: "utility",
    description: "Susun laporan otomatis (parameter, akurasi, peta) ke PDF/HTML.",
    inputs: [p("in", "Beragam", "any")],
    outputs: [],
    params: [
      {
        key: "template",
        label: "Template",
        type: "select",
        options: ["Ringkas", "Lengkap"],
        default: "Ringkas",
      },
    ],
  },
];

export const NODES_BY_ID: Record<string, NodeSpec> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);

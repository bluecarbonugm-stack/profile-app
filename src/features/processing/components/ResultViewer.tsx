import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { NODES_BY_ID } from "@/features/processing/data/nodes-catalog";
import type { NodeRunResult } from "@/features/processing";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface Props {
  nodeId: string | null;
  specId: string | null;
  onClose: () => void;
  result?: NodeRunResult;
}

// Mocked deterministic results per spec — enough to convey the "vibe" of results.
const varImportance = [
  { name: "DII_B2B3", value: 0.28 },
  { name: "B3", value: 0.19 },
  { name: "DII_B2B4", value: 0.17 },
  { name: "B2", value: 0.13 },
  { name: "DII_B3B4", value: 0.12 },
  { name: "B4", value: 0.11 },
];

const timeseries = [
  { year: "2016", "Terumbu Karang": 412, Lamun: 268, Makroalga: 91, Pasir: 340 },
  { year: "2018", "Terumbu Karang": 401, Lamun: 251, Makroalga: 96, Pasir: 355 },
  { year: "2020", "Terumbu Karang": 388, Lamun: 232, Makroalga: 104, Pasir: 372 },
  { year: "2022", "Terumbu Karang": 376, Lamun: 214, Makroalga: 111, Pasir: 386 },
];

const confusion = [
  ["", "Terumbu", "Lamun", "Makroalga", "Pasir", "UA (%)"],
  ["Terumbu", 42, 3, 1, 0, "91.3"],
  ["Lamun", 2, 38, 4, 1, "84.4"],
  ["Makroalga", 1, 3, 27, 0, "87.1"],
  ["Pasir", 0, 1, 0, 44, "97.8"],
  ["PA (%)", "93.3", "84.4", "84.4", "97.8", "OA 90.4"],
];

export function ResultViewer({ nodeId, specId, onClose, result }: Props) {
  // Escape must close the dialog — it is the first thing anyone reaches for,
  // and without it the only way out is the small × in the corner.
  useEffect(() => {
    if (!nodeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nodeId, onClose]);

  if (!nodeId || !specId) return null;
  const spec = NODES_BY_ID[specId];
  if (!spec) return null;

  const hasChart = spec.outputs.some((o) => o.type === "chart");
  const hasTable = spec.outputs.some((o) => o.type === "table");
  const hasRaster = spec.outputs.some((o) => o.type === "raster");
  const hasVector = spec.outputs.some((o) => o.type === "vector");

  const isRealResult = result !== undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Hasil ${spec.name}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="eyebrow text-accent">Result preview</p>
            <h2 className="mt-1.5 text-sm font-semibold">{spec.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {isRealResult && !result.implemented && (
            <p className="text-sm text-muted-foreground">
              Node ini belum diimplementasikan secara ilmiah pada Phase 1, data hanya diteruskan apa
              adanya dari node sebelumnya.
            </p>
          )}

          {isRealResult && result.implemented && result.summary && (
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(result.summary).map(([key, value]) => (
                  <tr key={key} className="border-b border-border">
                    <td className="py-1 pr-4 font-medium">{key}</td>
                    <td className="py-1">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isRealResult && spec.id === "rf-train" && (
            <>
              <Panel title="Variable Importance">
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={varImportance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--teal)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel title="OOB Report">
                <pre className="text-[11px] leading-relaxed bg-muted/40 p-3 rounded border border-border">
                  {`nTree = 300
Variable selection = sqrt
Impurity = Gini
OOB accuracy = 0.882
Kappa = 0.845
Kelas terbaik = Pasir (UA 0.978)
Kelas terlemah = Lamun (UA 0.844)`}
                </pre>
              </Panel>
            </>
          )}

          {!isRealResult && spec.id === "confusion-matrix" && (
            <Panel title="Confusion Matrix">
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <tbody>
                    {confusion.map((row, i) => (
                      <tr key={i} className={i === 0 ? "font-semibold bg-muted/40" : ""}>
                        {row.map((cell, j) => (
                          <td key={j} className="border border-border px-2 py-1.5 text-center">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="tabular mt-3 text-[11px] text-muted-foreground">
                Overall Accuracy 90.4% · Kappa 0.87
              </p>
            </Panel>
          )}

          {!isRealResult && spec.id === "timeseries-chart" && (
            <Panel title="Tren Luasan Kelas (ha)">
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={timeseries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Terumbu Karang" stroke="var(--coral)" />
                    <Line type="monotone" dataKey="Lamun" stroke="var(--teal)" />
                    <Line type="monotone" dataKey="Makroalga" stroke="oklch(0.55 0.2 145)" />
                    <Line type="monotone" dataKey="Pasir" stroke="var(--sand)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}

          {!isRealResult &&
            (hasRaster || hasVector) &&
            spec.id !== "rf-train" &&
            spec.id !== "confusion-matrix" && (
              <Panel title="Map Preview">
                <div className="relative h-64 rounded border border-border overflow-hidden bg-ocean-gradient">
                  <div className="absolute inset-0 bg-grid opacity-40" />
                  <div className="absolute bottom-3 left-3 text-[11px] bg-black/50 text-white px-2 py-1 rounded">
                    Preview raster / vektor: {spec.name}
                  </div>
                </div>
              </Panel>
            )}

          {!isRealResult &&
            hasChart &&
            spec.id !== "rf-train" &&
            spec.id !== "timeseries-chart" && (
              <Panel title="Chart">
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={varImportance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            )}

          {!isRealResult && hasTable && spec.id !== "confusion-matrix" && (
            <Panel title="Tabel Atribut">
              <table className="text-xs w-full border-collapse">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="border border-border px-2 py-1 text-left">id</th>
                    <th className="border border-border px-2 py-1 text-left">class</th>
                    <th className="border border-border px-2 py-1 text-left">area_ha</th>
                  </tr>
                </thead>
                <tbody>
                  {["Terumbu Karang", "Lamun", "Makroalga", "Pasir"].map((c, i) => (
                    <tr key={c}>
                      <td className="border border-border px-2 py-1">{i + 1}</td>
                      <td className="border border-border px-2 py-1">{c}</td>
                      <td className="border border-border px-2 py-1">
                        {(150 + i * 37).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          {!isRealResult && spec.outputs.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Node ini tidak menghasilkan output preview.
            </p>
          )}
        </div>

        {!isRealResult && (
          <footer className="shrink-0 border-t border-border px-5 py-3">
            <p className="eyebrow text-muted-foreground/70">
              Hasil disimulasikan untuk demo antarmuka
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow mb-3 text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

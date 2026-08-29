import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import { Button } from "@/shared/components/ui/button";

// Editorial content tied to one specific published result, so it lives in code
// rather than the spreadsheet - the figures below are cited in the 2023 guide
// and should not drift with routine content edits.
const CLASS_LEGEND = [
  { color: "oklch(0.68 0.17 45)", label: "Terumbu Karang", areaHa: 376 },
  { color: "oklch(0.6 0.15 165)", label: "Lamun", areaHa: 214 },
  { color: "oklch(0.55 0.2 145)", label: "Makroalga", areaHa: 111 },
  { color: "oklch(0.85 0.05 85)", label: "Pasir", areaHa: 386 },
];

const SPECS = [
  { label: "Sensor", value: "Sentinel-2 L2A" },
  { label: "Tanggal", value: "10 Juli 2022" },
  { label: "Resolusi", value: "10 m/piksel" },
  { label: "Skema", value: "Mayor (4 kelas)" },
  { label: "Algoritma", value: "Random Forest" },
  { label: "Overall Accuracy", value: "90.4%" },
];

const MAX_AREA_HA = 500;

export function CaseStudySection({ index }: { index: number }) {
  return (
    <Section id="studi-kasus">
      <SectionHeader
        index={index}
        eyebrow="Studi Kasus"
        title="Karimunjawa: Sentinel-2, 10 Juli 2022"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <figure className="relative min-h-[380px] overflow-hidden rounded-lg border border-border bg-ocean-gradient">
          <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-25" />
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id="cs-reef" cx="30%" cy="40%" r="30%">
                <stop offset="0%" stopColor="oklch(0.68 0.17 45)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="cs-seagrass" cx="65%" cy="55%" r="25%">
                <stop offset="0%" stopColor="oklch(0.6 0.15 165)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="cs-sand" cx="50%" cy="30%" r="18%">
                <stop offset="0%" stopColor="oklch(0.93 0.05 85)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="400" height="300" fill="url(#cs-reef)" />
            <rect x="0" y="0" width="400" height="300" fill="url(#cs-seagrass)" />
            <rect x="0" y="0" width="400" height="300" fill="url(#cs-sand)" />
          </svg>

          <figcaption className="eyebrow absolute left-4 top-4 rounded bg-black/45 px-2 py-1 text-white backdrop-blur-sm">
            Ilustrasi peta klasifikasi
          </figcaption>

          <ul className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5">
            {CLASS_LEGEND.map((entry) => (
              <li
                key={entry.label}
                className="flex items-center gap-1.5 rounded bg-black/45 px-2 py-1 text-[10px] text-white backdrop-blur-sm"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ background: entry.color }}
                />
                {entry.label}
              </li>
            ))}
          </ul>
        </figure>

        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            Kepulauan Karimunjawa, Jawa Tengah
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {SPECS.map((spec) => (
              <div key={spec.label}>
                <dt className="eyebrow text-muted-foreground">{spec.label}</dt>
                <dd className="tabular mt-1.5 text-sm font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-border pt-6">
            <p className="eyebrow text-accent">Ringkasan luasan (ha)</p>
            <ul className="mt-4 space-y-3">
              {CLASS_LEGEND.map((entry) => (
                <li key={entry.label}>
                  <div className="flex justify-between text-xs">
                    <span>{entry.label}</span>
                    <span className="tabular text-muted-foreground">{entry.areaHa}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(entry.areaHa / MAX_AREA_HA) * 100}%`,
                        background: entry.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            Alur: koreksi sunglint (Hedley) → Ln transform → koreksi kolom air (DII) → band stack →
            mask laut dangkal optis → Random Forest (nTree 300, Gini) → confusion matrix.
          </p>

          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link to="/processing">
              Buka alur ini di Workbench <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

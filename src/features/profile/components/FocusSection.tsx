import { Fish, Layers, LineChart, Satellite, Sprout, Waves, type LucideIcon } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import type { FocusPillar } from "../types";

// The spreadsheet stores an icon *key*, not a component, so editors can pick one
// without touching code. Unknown keys fall back to a neutral icon rather than
// rendering nothing.
const ICONS: Record<string, LucideIcon> = {
  satellite: Satellite,
  fish: Fish,
  sprout: Sprout,
  chart: LineChart,
  waves: Waves,
  layers: Layers,
};

export function FocusSection({ index, pillars }: { index: number; pillars: FocusPillar[] }) {
  if (pillars.length === 0) return null;

  return (
    <Section id="fokus" tone="muted">
      <SectionHeader
        index={index}
        eyebrow="Fokus Riset"
        title="Pilar kerja kelompok riset."
        description="Struktur riset kami mengikuti alur SOP pemetaan habitat perairan dangkal, dari pra-pemrosesan citra hingga analisis multi-temporal."
      />

      {/* Gap-as-border grid: one hairline between cells, none on the outside. */}
      <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar, i) => {
          const Icon = ICONS[pillar.icon?.toLowerCase() ?? ""] ?? Layers;
          return (
            <article
              key={pillar.title}
              className="reveal-item group flex flex-col gap-4 bg-card p-6 transition-colors hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-accent/15 text-accent-ink transition-colors group-hover:bg-accent/25">
                  <Icon className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span className="eyebrow tabular text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg leading-snug">{pillar.title}</h3>
              {pillar.body && (
                <p className="text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              )}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

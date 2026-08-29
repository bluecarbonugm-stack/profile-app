import { ArrowUpRight } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import { Badge } from "@/shared/components/ui/badge";
import type { Publication } from "../types";

export function PublicationsSection({
  index,
  publications,
}: {
  index: number;
  publications: Publication[];
}) {
  if (publications.length === 0) return null;

  return (
    <Section id="publikasi" tone="muted">
      <SectionHeader
        index={index}
        eyebrow="Publikasi & Output"
        title="Publikasi ilmiah, panduan teknis, dataset."
        aside={
          <p className="eyebrow text-muted-foreground">
            <span className="tabular">{String(publications.length).padStart(2, "0")}</span> entri
          </p>
        }
      />

      <ol className="mt-14 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {publications.map((pub) => (
          <li key={pub.title}>
            <PublicationRow pub={pub} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function PublicationRow({ pub }: { pub: Publication }) {
  const meta = [pub.venue, pub.doi].filter(Boolean).join(" · ");

  const inner = (
    <>
      <div className="flex shrink-0 items-center gap-3 md:w-36 md:flex-col md:items-start md:gap-2">
        {pub.year && <span className="tabular font-display text-2xl leading-none">{pub.year}</span>}
        {pub.type && <Badge variant="outline">{pub.type}</Badge>}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium leading-snug transition-colors group-hover:text-accent-ink">
          {pub.title}
        </h3>
        {pub.authors && <p className="mt-1.5 text-xs text-muted-foreground">{pub.authors}</p>}
        {meta && <p className="eyebrow mt-2 text-accent-ink">{meta}</p>}
      </div>

      {/* Only present when the sheet has a link - a control that goes nowhere
          is worse than no control. */}
      {pub.url && (
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-ink" />
      )}
    </>
  );

  const layout = "reveal-item group flex flex-col gap-4 p-6 md:flex-row md:gap-8";

  // The whole row is the link when there is one, rather than a small button
  // tucked at the end - a bigger target and one obvious affordance.
  return pub.url ? (
    <a
      href={pub.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`${layout} transition-colors hover:bg-muted/40`}
    >
      {inner}
    </a>
  ) : (
    <div className={layout}>{inner}</div>
  );
}

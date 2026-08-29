import { Building2 } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import { resolveImageUrl } from "../data/media";
import type { Partner } from "../types";

export function PartnersSection({ index, partners }: { index: number; partners: Partner[] }) {
  return (
    <Section id="mitra">
      <SectionHeader index={index} eyebrow="Mitra & Afiliasi" title="Kolaborator lintas sektor." />

      <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
        {partners.map((partner) => (
          <li key={partner.name}>
            <PartnerCell partner={partner} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function PartnerCell({ partner }: { partner: Partner }) {
  const logo = resolveImageUrl(partner.logo, 240);

  const inner = (
    <>
      <div className="flex h-8 items-center">
        {logo ? (
          <img
            src={logo}
            alt={partner.name}
            loading="lazy"
            className="max-h-8 w-auto max-w-full object-contain"
          />
        ) : (
          <Building2 className="h-4 w-4 text-accent" />
        )}
      </div>
      <div>
        <p className="text-xs font-medium leading-snug">{partner.name}</p>
        {partner.category && (
          <p className="mt-1 text-[11px] text-muted-foreground">{partner.category}</p>
        )}
      </div>
    </>
  );

  const layout = "flex h-full flex-col justify-between gap-4 bg-card p-5 transition-colors";

  return partner.url ? (
    <a
      href={partner.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`${layout} hover:bg-muted/40`}
    >
      {inner}
    </a>
  ) : (
    <div className={layout}>{inner}</div>
  );
}

import { Building2 } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import { SafeImage } from "@/shared/components/media/safe-image";
import { useLanguage } from "@/shared/lib/i18n/language-context";
import { resolveImageUrl } from "../data/media";
import type { Partner } from "../types";

/**
 * Infinite-scroll partner logo band, the pattern used by most research
 * groups/NGOs for a "trusted by" strip. The track renders `partners` twice
 * back-to-back and animates to -50% (see .animate-marquee in styles.css) so
 * the loop is seamless; pauses on hover so a name can actually be read.
 */
export function PartnersSection({ index, partners }: { index: number; partners: Partner[] }) {
  const { t } = useLanguage();
  if (partners.length === 0) return null;

  return (
    <Section id="mitra" tone="muted">
      <SectionHeader index={index} eyebrow={t("partners.eyebrow")} title={t("partners.title")} />

      <div className="marquee-viewport mt-14 overflow-hidden">
        <div className="animate-marquee flex w-max items-stretch gap-4">
          {[...partners, ...partners].map((partner, i) => (
            <PartnerCard key={`${partner.name}-${i}`} partner={partner} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const logo = resolveImageUrl(partner.logo, 240);

  const inner = (
    <>
      <div className="flex h-9 items-center">
        {logo ? (
          <SafeImage
            src={logo}
            alt={partner.name}
            loading="lazy"
            className="max-h-9 w-auto max-w-full object-contain grayscale opacity-75 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
            fallback={<Building2 className="h-5 w-5 text-accent-ink" />}
          />
        ) : (
          <Building2 className="h-5 w-5 text-accent-ink" />
        )}
      </div>
      <p className="text-xs font-medium leading-snug whitespace-nowrap">{partner.name}</p>
    </>
  );

  const layout =
    "group flex h-28 w-48 shrink-0 flex-col justify-between gap-3 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors";

  return partner.url ? (
    <a
      href={partner.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`${layout} hover:border-primary/40 hover:bg-muted/40`}
    >
      {inner}
    </a>
  ) : (
    <div className={layout}>{inner}</div>
  );
}

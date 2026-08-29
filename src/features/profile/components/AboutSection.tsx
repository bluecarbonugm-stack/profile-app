import { Section, Eyebrow } from "@/shared/components/layout/section";
import { useLanguage } from "@/shared/lib/i18n/language-context";
import type { SiteInfo } from "../types";

export function AboutSection({ index, site }: { index: number; site: SiteInfo }) {
  const { t } = useLanguage();
  if (!site.aboutTitle && site.aboutParagraphs.length === 0) return null;

  return (
    <Section id="tentang">
      <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] md:gap-16">
        <div>
          <Eyebrow index={index}>{t("about.eyebrow")}</Eyebrow>
          <h2 className="mt-4 text-3xl leading-[1.15] md:text-[2.5rem]">{site.aboutTitle}</h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          {site.aboutParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </Section>
  );
}

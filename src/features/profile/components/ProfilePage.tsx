import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { FocusSection } from "./FocusSection";
import { TeamSection } from "./TeamSection";
import { PublicationsSection } from "./PublicationsSection";
import { GallerySection } from "./GallerySection";
import { PartnersSection } from "./PartnersSection";
import { ContactSection } from "./ContactSection";
import { SiteFooter } from "./SiteFooter";
import type { ProfilePayload } from "../types";

/**
 * Composes the public profile page from content-driven sections. All copy,
 * stats, team, publications, gallery and partners come from `payload`
 * (Supabase, with `FALLBACK_CONTENT` served when the database is
 * unreachable - see `api/content-source.ts`) rather than being hardcoded
 * here, so editing content in `/admin` changes what visitors see without a
 * deploy.
 *
 * Every section below hides itself when its data is empty (see each
 * component's own guard). `nextIndex()` numbers only the sections that
 * actually render, so "03 · Tim Peneliti" never appears if section 2 was
 * skipped - there is intentionally no dedicated case-study/showcase section
 * here, because that content had no backing table and would otherwise be
 * exactly the hardcoded placeholder this page is trying to avoid.
 */
export function ProfilePage({ payload }: { payload: ProfilePayload }) {
  const { site, stats, focus, team, publications, gallery, partners } = payload.content;

  // Mirrors each section's own "hide when empty" guard, so a skipped section
  // doesn't leave a gap in the numbering (e.g. Team hidden -> Publications
  // still becomes "03", not "04").
  let n = 0;
  const idx = (visible: boolean) => (visible ? ++n : 0);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection site={site} stats={stats} />
      <AboutSection
        index={idx(Boolean(site.aboutTitle) || site.aboutParagraphs.length > 0)}
        site={site}
      />
      <FocusSection index={idx(focus.length > 0)} pillars={focus} />
      <TeamSection index={idx(team.length > 0)} members={team} />
      <PublicationsSection index={idx(publications.length > 0)} publications={publications} />
      <GallerySection index={idx(gallery.length > 0)} items={gallery} />
      <PartnersSection index={idx(partners.length > 0)} partners={partners} />
      <ContactSection index={idx(true)} site={site} />
      <SiteFooter payload={payload} />
    </div>
  );
}

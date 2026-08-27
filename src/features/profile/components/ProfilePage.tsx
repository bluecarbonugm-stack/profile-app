import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { FocusSection } from "./FocusSection";
import { TeamSection } from "./TeamSection";
import { PublicationsSection } from "./PublicationsSection";
import { CaseStudySection } from "./CaseStudySection";
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
 */
export function ProfilePage({ payload }: { payload: ProfilePayload }) {
  const { site, stats, focus, team, publications, gallery, partners } = payload.content;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection site={site} stats={stats} />
      <AboutSection index={1} site={site} />
      <FocusSection index={2} pillars={focus} />
      <TeamSection index={3} members={team} />
      <PublicationsSection index={4} publications={publications} />
      <CaseStudySection index={5} />
      <GallerySection index={6} items={gallery} />
      <PartnersSection index={7} partners={partners} />
      <ContactSection index={8} site={site} />
      <SiteFooter payload={payload} />
    </div>
  );
}

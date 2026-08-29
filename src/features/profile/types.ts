import { z } from "zod";

// Schema for the JSON returned by the Google Apps Script Web App. Everything a
// spreadsheet can leave blank is optional here - an editor forgetting to fill a
// cell must degrade to a missing field, never to a failed page render.

const trimmed = z.string().trim();
const optionalText = trimmed.optional().catch(undefined);
const optionalUrl = trimmed.url().optional().catch(undefined);

/** Sheets hand back numbers as text often enough that coercion is worth it. */
const order = z.coerce.number().optional().catch(undefined);

export const SiteInfoSchema = z.object({
  organizationName: trimmed.default("Blue Carbon Research Group"),
  faculty: trimmed.default("Fakultas Geografi UGM"),
  department: optionalText,
  badge: optionalText,
  /** Judul hero dirakit dari tiga bagian agar frasa tengah bisa di-italic. */
  headline: optionalText,
  headlineEmphasis: optionalText,
  headlineSuffix: optionalText,
  intro: optionalText,
  aboutTitle: optionalText,
  /** Paragraf "Tentang", dipisah baris baru di spreadsheet. */
  aboutParagraphs: z.array(trimmed).default([]),
  address: optionalText,
  email: optionalText,
  phone: optionalText,
  mapsUrl: optionalUrl,
  heroImage: optionalUrl,
  foundedYear: optionalText,
});

export const StatSchema = z.object({
  value: trimmed,
  label: trimmed,
  order,
});

export const FocusPillarSchema = z.object({
  /** Kunci ikon lucide; dipetakan di komponen dengan fallback aman. */
  icon: optionalText,
  title: trimmed,
  body: optionalText,
  order,
});

export const TeamMemberSchema = z.object({
  name: trimmed,
  role: optionalText,
  field: optionalText,
  photo: optionalUrl,
  bio: optionalText,
  email: optionalText,
  scholarUrl: optionalUrl,
  orcid: optionalText,
  order,
});

export const PublicationSchema = z.object({
  year: optionalText,
  type: optionalText,
  title: trimmed,
  authors: optionalText,
  venue: optionalText,
  url: optionalUrl,
  doi: optionalText,
  order,
});

export const GalleryItemSchema = z.object({
  title: trimmed,
  caption: optionalText,
  image: optionalUrl,
  location: optionalText,
  order,
});

export const PartnerSchema = z.object({
  name: trimmed,
  url: optionalUrl,
  logo: optionalUrl,
  category: optionalText,
  order,
});

export const ProfileContentSchema = z.object({
  site: SiteInfoSchema,
  stats: z.array(StatSchema).default([]),
  focus: z.array(FocusPillarSchema).default([]),
  team: z.array(TeamMemberSchema).default([]),
  publications: z.array(PublicationSchema).default([]),
  gallery: z.array(GalleryItemSchema).default([]),
  partners: z.array(PartnerSchema).default([]),
  updatedAt: optionalText,
});

export type SiteInfo = z.infer<typeof SiteInfoSchema>;
export type Stat = z.infer<typeof StatSchema>;
export type FocusPillar = z.infer<typeof FocusPillarSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Publication = z.infer<typeof PublicationSchema>;
export type GalleryItem = z.infer<typeof GalleryItemSchema>;
export type Partner = z.infer<typeof PartnerSchema>;
export type ProfileContent = z.infer<typeof ProfileContentSchema>;

/**
 * What the route hands to the page. `source` lets the UI (and the team) tell at
 * a glance whether they are looking at live spreadsheet content or the built-in
 * fallback, which otherwise is an easy thing to misdiagnose.
 */
export interface ProfilePayload {
  content: ProfileContent;
  source: "sheet" | "supabase" | "fallback";
  /** Reason the sheet was not used. Present only when `source` is "fallback". */
  reason?: string;
  fetchedAt: string;
}

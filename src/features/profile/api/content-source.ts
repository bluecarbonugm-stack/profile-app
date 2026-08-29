import { FALLBACK_CONTENT } from "../data/fallback-content";
import { ProfileContentSchema, type ProfileContent, type ProfilePayload } from "../types";
import { getSupabaseAnon } from "../../../shared/lib/supabase";

// Server-only. Reads profile content from Supabase, validates it, and caches
// it in memory. Falls back to bundled defaults when Supabase is unreachable.
//
// Supabase URL and keys are deliberately NOT read from `VITE_*` variables:
// those are inlined into the client bundle, which would publish the write-side
// surface to anyone who opens devtools.

const DEFAULT_TTL_SECONDS = 300;

interface CacheEntry {
  payload: ProfilePayload;
  expiresAt: number;
}

let cache: CacheEntry | undefined;

function env(key: string): string | undefined {
  const value = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return value?.trim() || undefined;
}

function ttlMs(): number {
  const raw = env("PROFILE_CONTENT_TTL_SECONDS");
  const parsed = raw ? Number(raw) : Number.NaN;
  const seconds = Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TTL_SECONDS;
  return seconds * 1000;
}

/** Drops keys whose value is undefined so a spread does not blank out defaults. */
function definedOnly<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value !== ""),
  ) as Partial<T>;
}

/**
 * `site` is one record with many fields rather than a list, so a half-filled row
 * should top up from the fallback instead of rendering a bare hero. Lists are
 * left alone: an empty list means "nothing to show", and the sections hide
 * themselves rather than silently displaying stale placeholder people.
 */
function mergeWithFallback(content: ProfileContent): ProfileContent {
  return {
    ...content,
    site: {
      ...FALLBACK_CONTENT.site,
      ...definedOnly(content.site),
      aboutParagraphs: content.site.aboutParagraphs.length
        ? content.site.aboutParagraphs
        : FALLBACK_CONTENT.site.aboutParagraphs,
    },
  };
}

function fallbackPayload(reason: string): ProfilePayload {
  return {
    content: FALLBACK_CONTENT,
    source: "fallback",
    reason,
    fetchedAt: new Date().toISOString(),
  };
}

/** Normalize a snake_case DB row into a camelCase ProfileContent field. */
function mapSiteRow(row: Record<string, unknown>): ProfileContent["site"] {
  return {
    organizationName: (row.organization_name as string) ?? "",
    faculty: (row.faculty as string) ?? "",
    department: (row.department as string) ?? "",
    badge: (row.badge as string) ?? "",
    headline: (row.headline as string) ?? "",
    headlineEmphasis: (row.headline_emphasis as string) ?? "",
    headlineSuffix: (row.headline_suffix as string) ?? "",
    intro: (row.intro as string) ?? "",
    aboutTitle: (row.about_title as string) ?? "",
    aboutParagraphs: (row.about_paragraphs as string[]) ?? [],
    address: (row.address as string) ?? undefined,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    mapsUrl: (row.maps_url as string) ?? undefined,
    heroImage: (row.hero_image as string) ?? undefined,
    foundedYear: (row.founded_year as string) ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListRows(
  rows: Record<string, unknown>[],
  mapper: (row: Record<string, unknown>) => Record<string, unknown>,
): Record<string, unknown>[] {
  return rows
    .sort((a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0))
    .map((row, i) => ({ ...mapper(row), order: (row.sort_order as number) ?? i + 1 }));
}

async function fetchFromSupabase(): Promise<ProfilePayload> {
  const supabase = getSupabaseAnon();

  // Fetch site (single row)
  const { data: siteRow, error: siteErr } = await supabase
    .from("site")
    .select("*")
    .limit(1)
    .single();

  if (siteErr) throw new Error(`Supabase site query: ${siteErr.message}`);

  // Fetch all list tables in parallel
  const [statsRes, focusRes, teamRes, pubRes, galleryRes, partnersRes] = await Promise.all([
    supabase.from("stats").select("*"),
    supabase.from("focus").select("*"),
    supabase.from("team").select("*"),
    supabase.from("publications").select("*"),
    supabase.from("gallery").select("*"),
    supabase.from("partners").select("*"),
  ]);

  // Check for errors
  const errors = [
    { name: "stats", res: statsRes },
    { name: "focus", res: focusRes },
    { name: "team", res: teamRes },
    { name: "publications", res: pubRes },
    { name: "gallery", res: galleryRes },
    { name: "partners", res: partnersRes },
  ].filter((e) => e.res.error);
  if (errors.length > 0) {
    throw new Error(
      `Supabase query errors: ${errors.map((e) => `${e.name}: ${e.res.error!.message}`).join(", ")}`,
    );
  }

  const content: ProfileContent = {
    site: mapSiteRow(siteRow as Record<string, unknown>),
    stats: mapListRows((statsRes.data as Record<string, unknown>[]) ?? [], (r) => ({
      value: (r.value as string) ?? "",
      label: (r.label as string) ?? "",
    })) as ProfileContent["stats"],
    focus: mapListRows((focusRes.data as Record<string, unknown>[]) ?? [], (r) => ({
      icon: (r.icon as string) ?? "",
      title: (r.title as string) ?? "",
      body: (r.body as string) ?? "",
    })) as ProfileContent["focus"],
    team: mapListRows((teamRes.data as Record<string, unknown>[]) ?? [], (r) => ({
      name: (r.name as string) ?? "",
      role: (r.role as string) ?? "",
      field: (r.field as string) ?? "",
      photo: (r.photo_url as string) ?? undefined,
    })) as ProfileContent["team"],
    publications: mapListRows((pubRes.data as Record<string, unknown>[]) ?? [], (r) => ({
      year: (r.year as string) ?? "",
      type: (r.type as string) ?? "",
      title: (r.title as string) ?? "",
      authors: (r.authors as string) ?? "",
      venue: (r.venue as string) ?? "",
    })) as ProfileContent["publications"],
    gallery: mapListRows((galleryRes.data as Record<string, unknown>[]) ?? [], (r) => ({
      title: (r.title as string) ?? "",
      caption: (r.caption as string) ?? "",
      image: (r.image_url as string) ?? undefined,
    })) as ProfileContent["gallery"],
    partners: mapListRows((partnersRes.data as Record<string, unknown>[]) ?? [], (r) => ({
      name: (r.name as string) ?? "",
    })) as ProfileContent["partners"],
    updatedAt: undefined,
  };

  return {
    content: mergeWithFallback(content),
    source: "supabase",
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Returns profile content, preferring Supabase and degrading to the
 * bundled fallback. Never throws: a Supabase outage must not take the site down.
 */
export async function loadProfileContent(): Promise<ProfilePayload> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.payload;

  const url = env("SUPABASE_URL");
  if (!url) {
    const payload = fallbackPayload("SUPABASE_URL is not set");
    cache = { payload, expiresAt: now + ttlMs() };
    return payload;
  }

  try {
    const payload = await fetchFromSupabase();
    cache = { payload, expiresAt: now + ttlMs() };
    return payload;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[profile] falling back to bundled content: ${reason}`);

    // Serve stale Supabase content rather than the fallback when we have some -
    // yesterday's real team list beats today's placeholder one.
    if (cache?.payload.source === "supabase") {
      const stale: ProfilePayload = { ...cache.payload, reason: `stale: ${reason}` };
      cache = { payload: stale, expiresAt: now + ttlMs() };
      return stale;
    }

    const payload = fallbackPayload(reason);
    cache = { payload, expiresAt: now + Math.min(ttlMs(), 60_000) };
    return payload;
  }
}

/** Clears the cache. Exposed for admin writes to trigger revalidation. */
export function invalidateProfileContentCache(): void {
  cache = undefined;
}

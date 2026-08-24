import { FALLBACK_CONTENT } from "../data/fallback-content";
import { ProfileContentSchema, type ProfileContent, type ProfilePayload } from "../types";

// Server-only. Reads profile content from the Google Apps Script Web App that
// fronts the team's spreadsheet, validates it, and caches it in memory.
//
// The endpoint URL and token are deliberately NOT read from `VITE_*` variables:
// those are inlined into the client bundle, which would publish the write-side
// surface of the sheet to anyone who opens devtools.

const DEFAULT_TTL_SECONDS = 300;
const REQUEST_TIMEOUT_MS = 8_000;

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

async function fetchFromSheet(endpoint: string): Promise<ProfilePayload> {
  const url = new URL(endpoint);
  const token = env("PROFILE_CONTENT_TOKEN");
  if (token) url.searchParams.set("token", token);

  const response = await fetch(url, {
    // Apps Script answers the /exec URL with a 302 to a googleusercontent host;
    // following redirects is required, not optional.
    redirect: "follow",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Apps Script responded ${response.status} ${response.statusText}`);
  }

  // A misconfigured deployment (e.g. access not set to "Anyone") returns a
  // Google sign-in *page* with status 200, so trust the body, not the status.
  const body = await response.text();
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(
      'Apps Script did not return JSON - check that the Web App is deployed with access set to "Anyone".',
    );
  }

  const parsed = ProfileContentSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      `Unexpected sheet shape: ${parsed.error.issues[0]?.message ?? "validation failed"}`,
    );
  }

  return {
    content: mergeWithFallback(parsed.data),
    source: "sheet",
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Returns profile content, preferring the spreadsheet and degrading to the
 * bundled fallback. Never throws: a Google outage must not take the site down.
 */
export async function loadProfileContent(): Promise<ProfilePayload> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.payload;

  const endpoint = env("PROFILE_CONTENT_ENDPOINT");
  if (!endpoint) {
    // Not an error - this is the expected state before the sheet is wired up.
    const payload = fallbackPayload("PROFILE_CONTENT_ENDPOINT is not set");
    cache = { payload, expiresAt: now + ttlMs() };
    return payload;
  }

  try {
    const payload = await fetchFromSheet(endpoint);
    cache = { payload, expiresAt: now + ttlMs() };
    return payload;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[profile] falling back to bundled content: ${reason}`);

    // Serve stale sheet content rather than the fallback when we have some -
    // yesterday's real team list beats today's placeholder one.
    if (cache?.payload.source === "sheet") {
      const stale: ProfilePayload = { ...cache.payload, reason: `stale: ${reason}` };
      cache = { payload: stale, expiresAt: now + ttlMs() };
      return stale;
    }

    const payload = fallbackPayload(reason);
    // Short retry window so a transient blip does not pin the fallback for the
    // full TTL.
    cache = { payload, expiresAt: now + Math.min(ttlMs(), 60_000) };
    return payload;
  }
}

/** Clears the cache. Exposed for a future revalidation webhook / admin action. */
export function invalidateProfileContentCache(): void {
  cache = undefined;
}

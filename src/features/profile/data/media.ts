// Photo URLs pasted into a spreadsheet are almost never direct image links.
// People share a Google Drive file and paste whatever the address bar shows,
// which renders an HTML viewer page, not an image - so <img src> breaks.
// Normalize the shapes we actually see into something an <img> can load.

const DRIVE_ID_PATTERNS = [
  /\/file\/d\/([\w-]{10,})/, // .../file/d/<id>/view
  /[?&]id=([\w-]{10,})/, // .../uc?export=view&id=<id>
  /\/d\/([\w-]{10,})/, // .../open?id / docs style
];

function driveFileId(url: string): string | undefined {
  if (!/(?:drive|docs)\.google\.com/.test(url)) return undefined;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = pattern.exec(url);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

/**
 * Turns a shared Drive link into a direct image URL. `width` requests a resized
 * copy from Google's CDN so a 6 MB field photo does not ship at full size.
 * Non-Drive URLs pass through untouched; anything unusable returns undefined so
 * callers can fall back to a placeholder.
 */
export function resolveImageUrl(url: string | undefined, width = 800): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const fileId = driveFileId(trimmed);
  if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;

  return /^https?:\/\//.test(trimmed) ? trimmed : undefined;
}

/** Initials for the avatar placeholder shown when a member has no photo. */
export function initialsOf(name: string): string {
  const words = name
    .replace(/\b(?:Prof|Dr|Ir|S\.Si|M\.Sc|M\.Si|Ph\.?D|S\.T)\.?\b/gi, "")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

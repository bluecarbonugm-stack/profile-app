/**
 * Standalone BCRG mark - a wave over a rising shoot, read as "coastal
 * ecosystem" rather than a generic icon standing in for the brand. Used
 * anywhere the organization needs a visual identity (nav, footer, hero)
 * until a real logo file is supplied via `site.logoUrl` (see
 * features/profile/types.ts) and swapped in at the call site.
 *
 * Pure `currentColor` + one accent fill, so it drops onto any background
 * (light nav, dark hero) by setting `className="text-<token>"` on the
 * wrapper, matching how the rest of the icon set (lucide) is themed here.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Blue Carbon Research Group"
    >
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M6 19c2.2 1.6 4.2 1.6 6.4 0 2.2-1.6 4.2-1.6 6.4 0 2.2 1.6 4.2 1.6 6.4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M6 23.5c2.2 1.6 4.2 1.6 6.4 0 2.2-1.6 4.2-1.6 6.4 0 2.2 1.6 4.2 1.6 6.4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M16 15V8.5M16 8.5c-1.8 0-3.2-1.2-3.6-3 1.9-.3 3.6.6 4.3 2.3M16 8.5c1.8 0 3.2-1.2 3.6-3-1.9-.3-3.6.6-4.3 2.3"
        fill="var(--sand)"
        stroke="var(--sand)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

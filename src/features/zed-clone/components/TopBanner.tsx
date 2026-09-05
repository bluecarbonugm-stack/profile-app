// Promo bar above the navbar. Design-only clone section, per
// zed-dev-uiux-brief.md - not wired to any real campaign/link.

export function TopBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-center text-xs"
      style={{ backgroundColor: "#1348DC", color: "#F7F7F2" }}
    >
      <span className="font-medium">Zed 1.0 is here.</span>
      <span className="opacity-90">The fastest way to write, understand, and improve code.</span>
      <a
        href="#hero"
        className="ml-1 underline decoration-white/50 underline-offset-2 hover:decoration-white"
      >
        See what&apos;s new →
      </a>
    </div>
  );
}

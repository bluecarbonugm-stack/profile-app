const NAV_LINKS = ["Product", "Resources", "Extensions", "Docs", "Business", "Pricing"];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
      style={{ backgroundColor: "#F7F7F2", borderBottom: "1px solid #0000000f" }}
    >
      <div className="flex items-center gap-8">
        <span
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
        >
          zed
        </span>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: "#474C55" }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <a href="#signup" className="text-sm font-medium" style={{ color: "#474C55" }}>
          Sign up
        </a>
        <a
          href="#download"
          className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1348DC", boxShadow: "0 1px 2px #00000026" }}
        >
          Download
        </a>
      </div>
    </header>
  );
}

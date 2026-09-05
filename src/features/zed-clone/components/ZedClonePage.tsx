import { TopBanner } from "./TopBanner";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { LiveActivityFeed } from "./LiveActivityFeed";
import { TerminalAscii } from "./TerminalAscii";
import { AgenticDemoPanel } from "./AgenticDemoPanel";

// Design clone of zed.dev's marketing page (signature sections only - see
// zed-dev-uiux-brief.md and docs/plans for the full 18-section scope and
// what's deferred). Self-contained visual system: does not use this app's
// profile-site tokens/components (--ocean-deep, <Section>, etc.).
export function ZedClonePage() {
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <TopBanner />
      <Navbar />
      <main>
        <Hero />
        <LiveActivityFeed />
        <TerminalAscii />
        <AgenticDemoPanel />
      </main>
    </div>
  );
}

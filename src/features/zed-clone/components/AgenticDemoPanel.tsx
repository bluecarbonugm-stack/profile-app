// Static mock of the agentic coding panel per brief §3.2 - a fixed chat
// transcript next to a fixed code preview with one linter annotation.
// Not interactive/wired to any model in this pass.

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

const CODE_LINES = [
  "function normalizeBand(band: Float32Array) {",
  "  const max = Math.max(...band);",
  "  return band.map((v) => v / max);",
  "}",
];

export function AgenticDemoPanel() {
  return (
    <section id="agent" className="px-6 py-20" style={{ backgroundColor: "#F0F0EA" }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl" style={{ fontWeight: 390, color: "#1B1B18" }}>
          An agent that writes, tests, and explains its own code
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div
            className="rounded-lg p-5"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 2px #00000026" }}
          >
            <p className="text-xs font-medium" style={{ color: "#8A8F98" }}>
              CHAT
            </p>
            <div className="mt-3 space-y-3 text-sm">
              <p style={{ color: "#1B1B18" }}>
                Normalize this band array to 0–1 before it goes into the classifier.
              </p>
              <p
                className="rounded-md p-3"
                style={{ backgroundColor: "#F7F7F2", color: "#474C55" }}
              >
                Added a <code style={{ fontFamily: MONO_FONT }}>normalizeBand</code> helper that
                divides each value by the array&apos;s max. One thing to check: this assumes a
                positive-only array, flagging the div-by-zero case below.
              </p>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-lg"
            style={{ backgroundColor: "#0F0F0D", boxShadow: "0 1px 2px #00000026" }}
          >
            <div
              className="px-4 py-2 text-xs"
              style={{
                borderBottom: "1px solid #ffffff14",
                color: "#8A8F98",
                fontFamily: MONO_FONT,
              }}
            >
              normalize.ts
            </div>
            <pre
              className="px-4 py-4 text-xs leading-relaxed md:text-sm"
              style={{ fontFamily: MONO_FONT }}
            >
              {CODE_LINES.map((line, i) => (
                <div key={i} style={{ color: "#E8E8E3" }}>
                  {line}
                  {i === 1 && (
                    <div
                      className="mt-1 rounded px-2 py-1 text-xs"
                      style={{ backgroundColor: "#FB2C3626", color: "#FB2C36" }}
                    >
                      ⚠ possible division by zero if max is 0
                    </div>
                  )}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

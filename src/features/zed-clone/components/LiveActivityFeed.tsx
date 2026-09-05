import { useEffect, useState } from "react";
import { cycledFeed } from "../data/mock-commits";

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const TICK_MS = 3000;

export function LiveActivityFeed() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const rows = cycledFeed(tick);

  return (
    <section id="activity" className="px-6 py-20" style={{ backgroundColor: "#F0F0EA" }}>
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl" style={{ fontWeight: 390, color: "#1B1B18" }}>
          Built in the open, in real time
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm" style={{ color: "#474C55" }}>
          A live look at commits landing on zed-industries/zed (mock data for this clone).
        </p>

        <div
          className="mt-10 overflow-hidden rounded-lg"
          style={{ backgroundColor: "#1B1B18", boxShadow: "0 3px 3px #0000001f" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs"
            style={{ borderBottom: "1px solid #ffffff14", color: "#8A8F98" }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#FB2C36" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#FFD500" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#00C950" }} />
            <span className="ml-2" style={{ fontFamily: MONO_FONT }}>
              zed.dev - activity
            </span>
          </div>

          <ul className="divide-y" style={{ borderColor: "#ffffff0f" }}>
            {rows.map((row, i) => (
              <li
                key={`${row.repo}-${row.message}-${i}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 text-sm"
                style={{ fontFamily: MONO_FONT, color: "#E8E8E3" }}
              >
                <span style={{ color: "#93CCDC" }}>{row.author}</span>
                <span className="truncate">{row.message}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs">
                  <span style={{ color: "#00C950" }}>+{row.additions}</span>
                  <span style={{ color: "#FB2C36" }}>-{row.deletions}</span>
                  <span
                    className="rounded px-1.5 py-0.5"
                    style={{ backgroundColor: "#ffffff14", color: "#8A8F98" }}
                  >
                    {row.branch}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

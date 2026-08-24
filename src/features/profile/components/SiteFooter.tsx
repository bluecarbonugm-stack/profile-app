import { Waves } from "lucide-react";

import type { ProfilePayload } from "../types";

export function SiteFooter({ payload }: { payload: ProfilePayload }) {
  const { site } = payload.content;

  return (
    <footer className="border-t border-white/10 bg-ocean-deep text-white/55">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 py-8 text-xs md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded bg-white/10">
            <Waves className="h-3 w-3" />
          </span>
          <span>
            © {new Date().getFullYear()} {site.organizationName} · {site.faculty}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span>
            Referensi metode: Harahap et al., <em>Panduan Teknis</em> (2023).
          </span>
          {payload.source === "sheet" && payload.content.updatedAt && (
            <span className="eyebrow text-white/35">Diperbarui {payload.content.updatedAt}</span>
          )}
        </div>
      </div>
    </footer>
  );
}

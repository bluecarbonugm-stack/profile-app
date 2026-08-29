import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/shared/components/ui/sonner";

const Workbench = lazy(() =>
  import("@/features/processing/components/Workbench").then((m) => ({ default: m.Workbench })),
);

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Processing Workbench - Blue Carbon Research Group" },
      {
        name: "description",
        content:
          "Kanvas node-based untuk merancang alur pemrosesan citra perairan dangkal: koreksi sunglint & kolom air, klasifikasi Random Forest, dan analisis multi-temporal.",
      },
      { property: "og:title", content: "Processing Workbench - Blue Carbon Research Group" },
      {
        property: "og:description",
        content:
          "Rancang pipeline geospasial habitat perairan dangkal dengan drag-and-drop node - terinspirasi Orange3.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProcessingRoute,
});

function ProcessingRoute() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="h-[calc(100vh-56px)] dark bg-background text-foreground flex flex-col">
      <MobileNotice />
      <div className="flex-1 min-h-0 hidden lg:block">
        {mounted && (
          <Suspense
            fallback={<div className="p-6 text-sm text-muted-foreground">Memuat workbench…</div>}
          >
            <Workbench />
          </Suspense>
        )}
      </div>
      <Toaster />
    </div>
  );
}

function MobileNotice() {
  return (
    <div className="lg:hidden flex-1 grid place-items-center p-6 text-center">
      <div className="max-w-sm">
        <div className="text-[11px] uppercase tracking-wider text-accent">Layar terlalu sempit</div>
        <h2 className="mt-2 text-2xl">Buka Processing di layar lebih lebar</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Workbench node-based dirancang untuk layar desktop/tablet lebar (≥1024 px) agar palette,
          kanvas, dan property panel bisa tampil bersamaan.
        </p>
      </div>
    </div>
  );
}

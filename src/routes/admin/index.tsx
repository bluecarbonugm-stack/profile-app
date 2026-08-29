import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/shared/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const SECTIONS = [
  { label: "Site Info", to: "/admin/site" },
  { label: "Tim", to: "/admin/team" },
  { label: "Publikasi", to: "/admin/publications" },
  { label: "Galeri", to: "/admin/gallery" },
  { label: "Statistik", to: "/admin/stats" },
  { label: "Focus Area", to: "/admin/focus" },
  { label: "Mitra", to: "/admin/partners" },
];

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-display">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Kelola konten situs Blue Carbon Research Group.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SECTIONS.map((item) => (
          <a key={item.to} href={item.to}>
            <Card className="p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/40">
              {item.label}
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

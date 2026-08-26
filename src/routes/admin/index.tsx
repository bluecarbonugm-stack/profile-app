import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#10316B]">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Kelola konten situs Blue Carbon Research Group.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Site Info", to: "/admin/site" },
          { label: "Tim", to: "/admin/team" },
          { label: "Publikasi", to: "/admin/publications" },
          { label: "Galeri", to: "/admin/gallery" },
          { label: "Statistik", to: "/admin/stats" },
          { label: "Focus Area", to: "/admin/focus" },
          { label: "Mitra", to: "/admin/partners" },
        ].map((item) => (
          <a
            key={item.to}
            href={item.to}
            className="rounded-lg border bg-white p-4 text-sm font-medium text-[#10316B] shadow-sm hover:bg-[#F2F7FF]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

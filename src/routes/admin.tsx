import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if sb-access-token cookie exists
    const hasToken = document.cookie.includes("sb-access-token=");
    if (!hasToken) {
      router.navigate({ to: "/admin/login" });
      return;
    }
    setAuthenticated(true);
  }, [router]);

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F7FF]">
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F7FF]">
      <nav className="border-b bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-sm font-bold text-[#10316B]">
            Admin
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/admin/site" className="text-gray-600 hover:text-[#0B409C]">
              Site
            </Link>
            <Link to="/admin/team" className="text-gray-600 hover:text-[#0B409C]">
              Tim
            </Link>
            <Link to="/admin/publications" className="text-gray-600 hover:text-[#0B409C]">
              Publikasi
            </Link>
            <Link to="/admin/gallery" className="text-gray-600 hover:text-[#0B409C]">
              Galeri
            </Link>
            <Link to="/admin/stats" className="text-gray-600 hover:text-[#0B409C]">
              Stats
            </Link>
            <Link to="/admin/focus" className="text-gray-600 hover:text-[#0B409C]">
              Focus
            </Link>
            <Link to="/admin/partners" className="text-gray-600 hover:text-[#0B409C]">
              Mitra
            </Link>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => {
                document.cookie = "sb-access-token=; path=/; max-age=0";
                window.location.href = "/admin/login";
              }}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

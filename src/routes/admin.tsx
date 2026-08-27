import { createFileRoute, Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV_LINKS = [
  { to: "/admin/site", label: "Site" },
  { to: "/admin/team", label: "Tim" },
  { to: "/admin/publications", label: "Publikasi" },
  { to: "/admin/gallery", label: "Galeri" },
  { to: "/admin/stats", label: "Stats" },
  { to: "/admin/focus", label: "Focus" },
  { to: "/admin/partners", label: "Mitra" },
] as const;

function AdminLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const location = useLocation();
  const isLoginRoute = location.pathname === "/admin/login";

  useEffect(() => {
    // The login page renders its own full-screen layout and must never be
    // gated by itself - checking the cookie here would redirect /admin/login
    // to /admin/login forever, stranding every visitor on "Memuat...".
    if (isLoginRoute) return;

    // Check if sb-access-token cookie exists
    const hasToken = document.cookie.includes("sb-access-token=");
    if (!hasToken) {
      router.navigate({ to: "/admin/login" });
      return;
    }
    setAuthenticated(true);
  }, [router, isLoginRoute]);

  if (isLoginRoute) {
    return <Outlet />;
  }

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Memuat…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-6">
          <Link to="/admin" className="text-sm font-semibold text-foreground">
            Admin
          </Link>
          <div className="flex flex-wrap gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground transition-colors hover:text-primary"
                activeProps={{ className: "text-primary font-medium" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => {
                document.cookie = "sb-access-token=; path=/; max-age=0";
                window.location.href = "/admin/login";
              }}
              className="text-sm text-muted-foreground transition-colors hover:text-destructive"
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

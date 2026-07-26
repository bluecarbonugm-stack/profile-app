import { Link, useRouterState } from "@tanstack/react-router";
import { Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isProcessing = pathname.startsWith("/processing");

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b backdrop-blur",
      isProcessing ? "border-border bg-card/90" : "border-border/60 bg-background/80",
    )}>
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid place-items-center h-7 w-7 rounded-md bg-ocean-gradient text-white">
            <Waves className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">
            Blue Carbon <span className="text-muted-foreground font-normal">Research Group</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/">Profile</NavLink>
          <NavLink to="/processing">Processing</NavLink>
        </nav>
        <div className="ml-auto hidden md:block text-[11px] text-muted-foreground">
          Fakultas Geografi · Universitas Gadjah Mada
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      activeProps={{ className: "!text-foreground !bg-muted font-medium" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}

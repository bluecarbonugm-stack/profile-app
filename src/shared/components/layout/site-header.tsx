import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/shared/components/brand/brand-mark";
import { LanguageSwitch } from "@/shared/components/layout/language-switch";
import { useLanguage } from "@/shared/lib/i18n/language-context";

export function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ocean-gradient text-white">
            <BrandMark className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">
            Blue Carbon <span className="font-normal text-muted-foreground">Research Group</span>
          </span>
        </Link>
        <div className="ml-auto hidden text-[11px] text-muted-foreground md:block">
          {t("nav.tagline")}
        </div>
        <LanguageSwitch />
      </div>
    </header>
  );
}

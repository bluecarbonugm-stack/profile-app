import { useLanguage } from "@/shared/lib/i18n/language-context";
import { cn } from "@/shared/lib/utils";

/** ID/EN toggle. A segmented pair rather than a dropdown - two options
 * never need a menu, and it stays legible/tappable at nav size. */
export function LanguageSwitch() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className="flex items-center rounded-full border border-border bg-card p-0.5 text-[11px] font-medium"
    >
      {(["id", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors",
            locale === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

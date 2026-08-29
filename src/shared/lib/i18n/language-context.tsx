import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LOCALES, translate, type Locale, type TranslationKey } from "./translations";

const STORAGE_KEY = "bcrg-locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * UI-chrome language toggle (ID/EN). Always renders "id" during SSR and the
 * first client render - there is no server-side locale detection (no cookie
 * read; see the /admin auth check for the same client-only pattern this
 * project already uses for cookies) - then syncs from localStorage in an
 * effect. A returning visitor who last picked English sees one flash of
 * Indonesian before it switches; that's the accepted tradeoff for keeping
 * this a client-only toggle instead of wiring cookie-based SSR locale
 * detection for a UI-chrome-only translation layer.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
    }
  }, []);

  // RootShell's <html> always renders lang="id" server-side (see
  // routes/__root.tsx) since there's no server-side locale detection here -
  // keep it in sync client-side for screen readers once we know the real
  // choice.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can throw in private-browsing/quota-exceeded edge cases -
      // the toggle still works for the rest of this session either way.
    }
  }

  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

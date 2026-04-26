"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type Locale = "ar" | "en";

interface I18nContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "ar",
  dir: "rtl",
  t: (k: string) => k,
  setLocale: () => {},
  isRTL: true,
});

export function useI18n() {
  return useContext(I18nContext);
}

// Flat key → value translations
export type Translations = Record<string, string>;

import ar from "./translations/ar";
import en from "./translations/en";

const translations: Record<Locale, Translations> = { ar, en };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRTL = locale === "ar";

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("optisize-locale", l); } catch {}
  }, []);

  // Load saved locale
  useEffect(() => {
    try {
      const saved = localStorage.getItem("optisize-locale") as Locale | null;
      if (saved === "ar" || saved === "en") setLocaleState(saved);
    } catch {}
  }, []);

  // Update document direction
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] ?? translations["ar"][key] ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

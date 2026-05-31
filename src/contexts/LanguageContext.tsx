'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useSyncExternalStore, useEffect } from 'react';
import { Locale, translations } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translations.ar;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'ar',
  setLocale: () => {},
  t: translations.ar,
  dir: 'rtl',
});

const STORAGE_KEY = 'optigroup-locale';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): Locale {
  if (typeof window === 'undefined') return 'ar';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'ar' || saved === 'en') return saved;
  return 'ar';
}

function getServerSnapshot(): Locale {
  return 'ar';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const storedLocale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [locale, setLocaleState] = useState<Locale>(storedLocale);

  // Sync with external store changes
  if (locale !== storedLocale) {
    setLocaleState(storedLocale);
  }

  // Update HTML dir and lang attributes when locale changes
  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  const t = translations[locale];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const value = useMemo(() => ({ locale, setLocale, t, dir }), [locale, setLocale, t, dir]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { dictionaries, type Locale, type Dict } from "./dictionaries";

type I18nValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dict;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = "ar",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      (localStorage.getItem("locale") as Locale | null)) as Locale | null;
    if (stored && stored !== locale) setLocaleState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale);
      document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = useCallback(
    () => setLocaleState((l) => (l === "ar" ? "en" : "ar")),
    []
  );

  const value: I18nValue = {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    t: dictionaries[locale],
    setLocale,
    toggleLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

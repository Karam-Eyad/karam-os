"use client";

import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { Button } from "./ui";

export function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();
  return (
    <Button variant="outline" onClick={toggleLocale} className="px-3 py-1.5">
      {locale === "ar" ? "EN" : "ع"}
    </Button>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="px-3 py-1.5"
      aria-label="toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </Button>
  );
}

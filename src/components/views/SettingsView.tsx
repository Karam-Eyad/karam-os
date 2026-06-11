"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { PageHeader } from "@/components/PageHeader";
import { Button, Input, Label, Card } from "@/components/ui";
import { updateProfile, signOut } from "@/app/actions";
import { clsx } from "@/lib/clsx";
import type { Locale } from "@/lib/i18n/dictionaries";

export function SettingsView({
  fullName,
  email,
  locale: dbLocale,
  emailReminders,
}: {
  fullName: string;
  email: string;
  locale: string;
  emailReminders: boolean;
}) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  async function handle(formData: FormData) {
    setLocale(formData.get("locale") as Locale);
    await updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="animate-rise max-w-2xl">
      <PageHeader eyebrow={t.account} title={t.settings} />

      <form action={handle}>
        <Card className="mb-4 p-5">
          <div className="space-y-4">
            <div>
              <Label>{t.fullName}</Label>
              <Input name="full_name" defaultValue={fullName} />
            </div>
            <div>
              <Label>{t.email}</Label>
              <Input value={email} disabled className="opacity-60" />
            </div>
            <div>
              <Label>{t.language}</Label>
              <div className="flex gap-2">
                {(["ar", "en"] as Locale[]).map((l) => (
                  <label
                    key={l}
                    className={clsx(
                      "transition-base flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-center text-sm font-medium",
                      locale === l
                        ? "border-primary bg-accent-soft text-primary"
                        : "border-border hover:bg-surface-2"
                    )}
                  >
                    <input
                      type="radio"
                      name="locale"
                      value={l}
                      defaultChecked={dbLocale === l}
                      onChange={() => setLocale(l)}
                      className="hidden"
                    />
                    {l === "ar" ? "العربية" : "English"}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm font-medium">{t.emailReminders}</span>
              <input
                type="checkbox"
                name="email_reminders"
                defaultChecked={emailReminders}
                className="h-5 w-5 accent-[var(--primary)]"
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit">{t.save}</Button>
            {saved && (
              <span className="animate-pop text-sm text-emerald-500">✓</span>
            )}
          </div>
        </Card>
      </form>

      <Card className="mb-4 flex items-center justify-between p-5">
        <span className="text-sm font-medium">{t.theme}</span>
        <Button variant="outline" onClick={toggleTheme}>
          {theme === "dark" ? t.light : t.dark}
        </Button>
      </Card>

      <form action={signOut}>
        <Button variant="danger" type="submit">
          {t.logout}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Button, Input, Label, Card } from "@/components/ui";
import { LanguageToggle, ThemeToggle } from "@/components/Toggles";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/settings`,
    });
    setLoading(false);
    setInfo(t.resetSent);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t.appName}</h1>
          <div className="flex gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <Card className="p-6">
          <h2 className="mb-5 text-lg font-semibold">{t.resetPassword}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>{t.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {info && <p className="text-sm text-emerald-500">{info}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loading : t.sendResetLink}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t.login}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

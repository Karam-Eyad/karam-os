"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Button, Input, Label, Card } from "./ui";
import { LanguageToggle, ThemeToggle } from "./Toggles";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  const router = useRouter();
  const nextUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/"
      : "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) return setError(error.message);
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/");
      else setInfo(t.checkEmail);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
      router.replace(nextUrl);
      router.refresh();
    }
  }

  async function handleGoogle() {
    setError(null);
    const callbackUrl =
      nextUrl && nextUrl !== "/"
        ? `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`
        : `${siteUrl}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
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
          <h2 className="mb-1 text-lg font-semibold">
            {mode === "login" ? t.login : t.signup}
          </h2>
          <p className="mb-5 text-sm text-muted">{t.tagline}</p>

          <Button
            type="button"
            variant="outline"
            className="mb-4 w-full"
            onClick={handleGoogle}
          >
            <GoogleIcon />
            {t.continueWithGoogle}
          </Button>

          <div className="mb-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            {t.or}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <Label>{t.fullName}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <Label>{t.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t.password}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {info && <p className="text-sm text-emerald-500">{info}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loading : mode === "login" ? t.login : t.signup}
            </Button>
          </form>

          {mode === "login" && (
            <div className="mt-3 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>
          )}

          <p className="mt-5 text-center text-sm text-muted">
            {mode === "login" ? t.noAccount : t.haveAccount}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="font-medium text-primary hover:underline"
            >
              {mode === "login" ? t.signup : t.login}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

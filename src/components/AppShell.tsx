"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { signOut } from "@/app/actions";
import { clsx } from "@/lib/clsx";
import {
  TodayIcon,
  WeekIcon,
  ProjectsIcon,
  TasksIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  LogoutIcon,
} from "./icons";

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}) {
  const { t, locale, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: t.today, icon: TodayIcon },
    { href: "/week", label: t.week, icon: WeekIcon },
    { href: "/projects", label: t.projects, icon: ProjectsIcon },
    { href: "/tasks", label: t.allTasks, icon: TasksIcon },
    { href: "/settings", label: t.settings, icon: SettingsIcon },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-fg text-sm font-black">
          K
        </div>
        <span className="text-base font-bold tracking-tight">{t.appName}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                "transition-base group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active
                  ? "bg-accent-soft text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <Icon
                className={clsx(
                  "transition-base",
                  active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-5 pt-3">
        <div className="flex items-center gap-1.5 px-1">
          <button
            onClick={toggleLocale}
            className="transition-base flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-2"
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="theme"
            className="transition-base grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-surface-2"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold uppercase">
            {(userName || userEmail || "?").slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName || "—"}</p>
            <p className="truncate text-xs text-muted">{userEmail}</p>
          </div>
          <form action={signOut}>
            <button
              aria-label={t.logout}
              className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-e border-border bg-surface md:block">
        {SidebarInner}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="animate-pop absolute inset-y-0 start-0 w-64 border-e border-border bg-surface">
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border"
          >
            <span className="text-lg">☰</span>
          </button>
          <span className="font-bold">{t.appName}</span>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

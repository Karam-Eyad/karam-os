"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { TaskItem } from "@/components/TaskItem";
import { TaskDialog } from "@/components/TaskDialog";
import { clsx } from "@/lib/clsx";
import type { Project, TaskWithProject } from "@/lib/types";

export function WeekView({
  days,
  tasksByDay,
  projects,
  offset,
  todayISO,
  rangeLabel,
}: {
  days: string[];
  tasksByDay: Record<string, TaskWithProject[]>;
  projects: Pick<Project, "id" | "name" | "color">[];
  offset: number;
  todayISO: string;
  rangeLabel: string;
}) {
  const { t, locale } = useI18n();

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={rangeLabel}
        title={t.week}
        action={
          <div className="flex items-center gap-1.5">
            <NavBtn href={`/week?w=${offset - 1}`}>‹</NavBtn>
            {offset !== 0 && (
              <Link
                href="/week"
                className="transition-base rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2"
              >
                {t.today}
              </Link>
            )}
            <NavBtn href={`/week?w=${offset + 1}`}>›</NavBtn>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((iso) => {
          const date = new Date(iso);
          const isToday = iso === todayISO;
          const list = tasksByDay[iso] ?? [];
          const weekday = date.toLocaleDateString(
            locale === "ar" ? "ar" : "en-US",
            { weekday: "short" }
          );
          return (
            <div
              key={iso}
              className={clsx(
                "flex min-h-[7rem] flex-col rounded-xl border bg-surface p-2.5",
                isToday ? "border-primary" : "border-border"
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    isToday ? "text-primary" : "text-muted"
                  )}
                >
                  {weekday}
                </span>
                <span
                  className={clsx(
                    "grid h-6 w-6 place-items-center rounded-full text-xs font-bold tabular-nums",
                    isToday
                      ? "bg-primary text-primary-fg"
                      : "text-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                {list.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    projects={projects}
                    showDate={false}
                  />
                ))}
              </div>
              <div className="pt-1.5">
                <TaskDialog
                  projects={projects}
                  defaultDate={iso}
                  trigger="inline"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="transition-base grid h-9 w-9 place-items-center rounded-lg border border-border text-lg hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}

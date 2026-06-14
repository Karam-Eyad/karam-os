"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { TaskDialog } from "@/components/TaskDialog";
import { clsx } from "@/lib/clsx";
import { clientToggleTask } from "@/lib/client-mutations";
import type { Project, TaskWithProject } from "@/lib/types";

// ─── Priority colours ────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#10b981",
};

// ─── Status pill ─────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  done:        "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
};

// ─── Compact card for week columns ───────────────────────────────────────────
function WeekTaskCard({
  task,
  projects,
}: {
  task: TaskWithProject;
  projects: Pick<Project, "id" | "name" | "color">[];
}) {
  const { t } = useI18n();
  const [done, setDone] = useState(task.status === "done");

  function handleToggle() {
    const prev = done;
    setDone(!prev);
    clientToggleTask(task.id, prev ? "done" : "todo", {
      title:       task.title,
      description: task.description ?? null,
      due_date:    task.due_date ?? null,
      priority:    task.priority,
      recurrence:  task.recurrence,
      project_id:  task.project_id ?? null,
    }).catch(() => setDone(prev));
  }

  const accent = PRIORITY_COLOR[task.priority] ?? "#94a3b8";

  return (
    <div
      className={clsx(
        "group relative flex items-start gap-2 overflow-hidden rounded-lg border border-border bg-surface",
        "px-2 py-1.5 transition-base hover:border-border-strong hover:shadow-soft",
        done && "opacity-50"
      )}
    >
      {/* Priority accent bar */}
      <span
        className="absolute inset-y-0 start-0 w-[3px] rounded-s-lg"
        style={{ background: accent }}
      />

      {/* Toggle */}
      <button
        onClick={handleToggle}
        aria-label={done ? t.markUndone : t.markDone}
        className={clsx(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-base",
          done
            ? "border-primary bg-primary text-primary-fg"
            : "border-border-strong hover:border-primary"
        )}
      >
        {done && (
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1 ps-0.5">
        <p
          className={clsx(
            "line-clamp-2 text-[11px] font-medium leading-snug",
            done ? "text-muted line-through" : "text-foreground"
          )}
        >
          {task.title}
        </p>

        {/* Status — only show if not todo */}
        {task.status !== "todo" && !done && (
          <span
            className={clsx(
              "mt-1 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              STATUS_STYLE[task.status] ?? "bg-surface-2 text-muted"
            )}
          >
            {t[task.status as keyof typeof t] ?? task.status}
          </span>
        )}

        {/* Project dot */}
        {task.project && (
          <div className="mt-1 flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: task.project.color }}
            />
            <span className="truncate text-[9px] text-muted">
              {task.project.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main WeekView ────────────────────────────────────────────────────────────
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

      {/* 7-column grid — collapses to 2 on mobile */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {days.map((iso) => {
          const date    = new Date(iso);
          const isToday = iso === todayISO;
          const list    = tasksByDay[iso] ?? [];
          const weekday = date.toLocaleDateString(
            locale === "ar" ? "ar-SA" : "en-US",
            { weekday: "short" }
          );

          return (
            <div
              key={iso}
              className={clsx(
                "flex min-h-[8rem] flex-col rounded-xl border bg-surface p-2 transition-base",
                isToday
                  ? "border-primary/60 shadow-[0_0_0_1px_var(--color-primary,#4f46e5)]/10"
                  : "border-border"
              )}
            >
              {/* Day header */}
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={clsx(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    isToday ? "text-primary" : "text-muted"
                  )}
                >
                  {weekday}
                </span>
                <span
                  className={clsx(
                    "grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold tabular-nums",
                    isToday
                      ? "bg-primary text-primary-fg"
                      : "text-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-1">
                {list.length === 0 ? (
                  <p className="pt-1 text-center text-[10px] text-muted/50">—</p>
                ) : (
                  list.map((task) => (
                    <WeekTaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                    />
                  ))
                )}
              </div>

              {/* Add task */}
              <div className="mt-2">
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

// ─── Nav button ───────────────────────────────────────────────────────────────
function NavBtn({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="transition-base grid h-9 w-9 place-items-center rounded-lg border border-border text-lg hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}

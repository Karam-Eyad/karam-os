"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { TaskItem } from "@/components/TaskItem";
import { TaskDialog } from "@/components/TaskDialog";
import { HabitRing } from "@/components/HabitRing";
import { HabitIconRenderer } from "@/components/icons";
import { useTodayTasks, useProjects, useHabits } from "@/lib/hooks";
import { todayISO as getTodayISO } from "@/lib/date";

export function TodayView({ userName }: { userName: string }) {
  const { t, locale } = useI18n();
  const todayISO = getTodayISO();
  const { data: allTodayTasks = [], isLoading } = useTodayTasks();
  const { data: projects = [] } = useProjects();
  const { data: habits = [] } = useHabits(todayISO);

  // Split tasks into overdue and today
  const today = new Date().toISOString().slice(0, 10);
  const overdue = allTodayTasks.filter((t) => t.due_date && t.due_date < today);
  const todayTasks = allTodayTasks.filter(
    (t) => !t.due_date || t.due_date === today
  );

  if (isLoading)
    return (
      <div className="animate-pulse space-y-3 pt-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-2" />
        ))}
      </div>
    );

  const doneCount = todayTasks.filter((x) => x.status === "done").length;
  const dateLabel = new Date().toLocaleDateString(
    locale === "ar" ? "ar" : "en-US",
    { weekday: "long", day: "numeric", month: "long" }
  );

  const stats = [
    { label: t.today, value: todayTasks.length },
    { label: t.completed, value: doneCount },
    { label: t.overdue, value: overdue.length },
  ];

  // Habits mini section
  const habitsDone = habits.filter((h) =>
    h.logs.some((l) => l.completed_date === todayISO)
  ).length;
  const habitsTotal = habits.length;
  const habitsPct =
    habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={dateLabel}
        title={`${t.welcome}${userName ? "، " + userName : ""}`}
        action={<TaskDialog projects={projects} defaultDate={todayISO} />}
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface px-4 py-3.5 animate-slide-up"
          >
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Habits mini section */}
      {habitsTotal > 0 && (
        <Link href="/habits" className="mb-7 block">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5 hover-lift transition-base cursor-pointer animate-slide-up stagger-2">
            <HabitRing percent={habitsPct} size={44} stroke={4} color="var(--primary)">
              <span className="text-xs font-bold tabular-nums">{habitsPct}%</span>
            </HabitRing>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.todayHabits}</p>
              <p className="mt-0.5 text-xs text-muted">
                {habitsDone}/{habitsTotal}
              </p>
            </div>
            <div className="flex -space-x-1">
              {habits.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className="grid h-7 w-7 place-items-center rounded-full border-2 border-surface"
                  style={{
                    background: h.logs.some((l) => l.completed_date === todayISO)
                      ? h.color
                      : "var(--surface-2)",
                    color: h.logs.some((l) => l.completed_date === todayISO)
                      ? "white"
                      : "var(--muted)",
                  }}
                >
                  <HabitIconRenderer icon={h.icon} width={13} height={13} />
                </div>
              ))}
            </div>
          </div>
        </Link>
      )}

      {overdue.length > 0 && (
        <section className="mb-6">
          <p className="eyebrow mb-2.5 text-red-500">{t.overdue}</p>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskItem key={task.id} task={task} projects={projects} />
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="eyebrow mb-2.5">{t.todaySummary}</p>
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <EmptyToday text={t.noTasks} />
          ) : (
            todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projects={projects}
                showDate={false}
              />
            ))
          )}
          <div className="pt-1">
            <TaskDialog
              projects={projects}
              defaultDate={todayISO}
              trigger="inline"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyToday({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
      {text}
    </div>
  );
}

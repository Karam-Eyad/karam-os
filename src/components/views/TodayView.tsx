"use client";

import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { TaskItem } from "@/components/TaskItem";
import { TaskDialog } from "@/components/TaskDialog";
import type { Project, TaskWithProject } from "@/lib/types";

export function TodayView({
  userName,
  overdue,
  today,
  projects,
  todayISO,
}: {
  userName: string;
  overdue: TaskWithProject[];
  today: TaskWithProject[];
  projects: Pick<Project, "id" | "name" | "color">[];
  todayISO: string;
}) {
  const { t, locale } = useI18n();

  const doneCount = today.filter((x) => x.status === "done").length;
  const dateLabel = new Date().toLocaleDateString(
    locale === "ar" ? "ar" : "en-US",
    { weekday: "long", day: "numeric", month: "long" }
  );

  const stats = [
    { label: t.today, value: today.length },
    { label: t.completed, value: doneCount },
    { label: t.overdue, value: overdue.length },
  ];

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={dateLabel}
        title={`${t.welcome}${userName ? "، " + userName : ""} 👋`}
        action={<TaskDialog projects={projects} defaultDate={todayISO} />}
      />

      <div className="mb-7 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface px-4 py-3.5"
          >
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </div>

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
          {today.length === 0 ? (
            <EmptyToday text={t.noTasks} />
          ) : (
            today.map((task) => (
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

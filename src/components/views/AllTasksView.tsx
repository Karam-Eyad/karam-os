"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { TaskItem } from "@/components/TaskItem";
import { TaskDialog } from "@/components/TaskDialog";
import { clsx } from "@/lib/clsx";
import type { Project, Status, TaskWithProject } from "@/lib/types";

type Filter = "all" | Status;

export function AllTasksView({
  tasks,
  projects,
}: {
  tasks: TaskWithProject[];
  projects: Pick<Project, "id" | "name" | "color">[];
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const [projectId, setProjectId] = useState<string>("");

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.allTasks },
    { key: "todo", label: t.todo },
    { key: "in_progress", label: t.in_progress },
    { key: "done", label: t.done },
  ];

  const visible = useMemo(
    () =>
      tasks.filter(
        (x) =>
          (filter === "all" || x.status === filter) &&
          (!projectId || x.project_id === projectId)
      ),
    [tasks, filter, projectId]
  );

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={t.allTasks}
        title={t.allTasks}
        action={<TaskDialog projects={projects} />}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                "transition-base rounded-md px-3 py-1.5 text-sm font-medium",
                filter === f.key
                  ? "bg-accent-soft text-primary"
                  : "text-muted hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t.projects}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-12 text-center text-sm text-muted">
            {t.noTasks}
          </div>
        ) : (
          visible.map((task) => (
            <TaskItem key={task.id} task={task} projects={projects} />
          ))
        )}
      </div>
    </div>
  );
}

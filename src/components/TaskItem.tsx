"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/context";
import { clsx } from "@/lib/clsx";
import { toggleTask, deleteTask } from "@/app/actions";
import { TaskDialog } from "./TaskDialog";
import { CheckIcon, RepeatIcon, TrashIcon } from "./icons";
import { isPast } from "@/lib/date";
import type { Project, TaskWithProject } from "@/lib/types";

const priorityColor: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

export function TaskItem({
  task,
  projects,
  showDate = true,
}: {
  task: TaskWithProject;
  projects: Pick<Project, "id" | "name" | "color">[];
  showDate?: boolean;
}) {
  const { t, locale } = useI18n();
  // Optimistic local state — flip immediately on click; server syncs in bg.
  const [done, setDone] = useState(task.status === "done");
  const [, startTransition] = useTransition();

  const overdue = !done && task.due_date && isPast(task.due_date);

  function handleToggle() {
    setDone((prev) => !prev); // instant visual feedback
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", task.id);
      await toggleTask(fd);
    });
  }

  return (
    <div
      className={clsx(
        "transition-base group flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3",
        "hover:border-border-strong hover:shadow-soft",
        done && "opacity-60"
      )}
    >
      <button
        onClick={handleToggle}
        aria-label={done ? t.markUndone : t.markDone}
        className={clsx(
          "transition-base grid h-5 w-5 shrink-0 place-items-center rounded-full border",
          done
            ? "border-primary bg-primary text-primary-fg"
            : "border-border-strong hover:border-primary"
        )}
      >
        {done && <CheckIcon width={13} height={13} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: priorityColor[task.priority] }}
            title={t[task.priority]}
          />
          <p
            className={clsx(
              "truncate text-sm font-medium",
              done && "line-through"
            )}
          >
            {task.title}
          </p>
          {task.recurrence !== "none" && (
            <RepeatIcon
              width={13}
              height={13}
              className="shrink-0 text-muted"
            />
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 ps-3.5 text-xs text-muted">
          {task.project && (
            <span className="inline-flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: task.project.color }}
              />
              {task.project.name}
            </span>
          )}
          {showDate && task.due_date && (
            <span className={clsx(overdue && "font-medium text-red-500")}>
              {new Date(task.due_date).toLocaleDateString(
                locale === "ar" ? "ar" : "en-US",
                { day: "numeric", month: "short" }
              )}
              {overdue && ` · ${t.overdue}`}
            </span>
          )}
          {task.status === "in_progress" && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
              {t.in_progress}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
        <TaskDialog projects={projects} task={task} />
        <form action={deleteTask}>
          <input type="hidden" name="id" value={task.id} />
          <button
            aria-label={t.delete}
            className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500"
          >
            <TrashIcon width={15} height={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

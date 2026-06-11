"use client";

import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { ProjectDialog } from "@/components/ProjectDialog";
import { deleteProject } from "@/app/actions";
import { TrashIcon } from "@/components/icons";
import type { Project } from "@/lib/types";

type ProjectStat = Project & { total: number; done: number };

export function ProjectsView({ projects }: { projects: ProjectStat[] }) {
  const { t } = useI18n();

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={t.projects}
        title={t.projects}
        action={<ProjectDialog />}
      />

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-14 text-center text-sm text-muted">
          {t.noProjects}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            return (
              <div
                key={p.id}
                className="transition-base group relative overflow-hidden rounded-xl border border-border bg-surface p-4 hover:shadow-soft"
              >
                <span
                  className="absolute inset-y-0 start-0 w-1"
                  style={{ background: p.color }}
                />
                <div className="flex items-start justify-between gap-3 ps-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{p.name}</h3>
                    {p.track && (
                      <p className="mt-0.5 text-xs text-muted">{p.track}</p>
                    )}
                  </div>
                  <div className="flex items-center opacity-0 transition group-hover:opacity-100">
                    <ProjectDialog project={p} />
                    <form action={deleteProject}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        aria-label={t.delete}
                        className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500"
                      >
                        <TrashIcon width={15} height={15} />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-4 ps-2">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted">
                      {p.done}/{p.total} {t.tasksCount}
                    </span>
                    <span className="font-bold tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

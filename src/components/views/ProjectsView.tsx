"use client";

import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { ProjectDialog } from "@/components/ProjectDialog";
import { clientDeleteProject } from "@/lib/client-mutations";
import { useProjectsWithCounts } from "@/lib/hooks";
import { TrashIcon } from "@/components/icons";

export function ProjectsView() {
  const { t } = useI18n();
  const { data: items = [], isLoading } = useProjectsWithCounts();

  if (isLoading)
    return (
      <div className="animate-pulse space-y-3 pt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface-2" />
        ))}
      </div>
    );

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={t.projects}
        title={t.projects}
        action={<ProjectDialog />}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-14 text-center text-sm text-muted">
          {t.noProjects}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(({ project, total, done }) => {
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div
                key={project.id}
                className="transition-base group relative overflow-hidden rounded-xl border border-border bg-surface p-4 hover:shadow-soft"
              >
                <span
                  className="absolute inset-y-0 start-0 w-1"
                  style={{ background: project.color }}
                />
                <div className="flex items-start justify-between gap-3 ps-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{project.name}</h3>
                    {project.track && (
                      <p className="mt-0.5 text-xs text-muted">{project.track}</p>
                    )}
                  </div>
                  <div className="flex items-center opacity-0 transition group-hover:opacity-100">
                    <ProjectDialog project={project} />
                    <button
                      aria-label={t.delete}
                      onClick={() => clientDeleteProject(project.id)}
                      className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500"
                    >
                      <TrashIcon width={15} height={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 ps-2">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted">
                      {done}/{total} {t.tasksCount}
                    </span>
                    <span className="font-bold tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: project.color }}
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

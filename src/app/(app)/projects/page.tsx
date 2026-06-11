import { createClient } from "@/lib/supabase/server";
import { ProjectsView } from "@/components/views/ProjectsView";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at"),
    supabase.from("tasks").select("project_id, status"),
  ]);

  const counts: Record<string, { total: number; done: number }> = {};
  for (const tk of tasks ?? []) {
    if (!tk.project_id) continue;
    counts[tk.project_id] ??= { total: 0, done: 0 };
    counts[tk.project_id].total++;
    if (tk.status === "done") counts[tk.project_id].done++;
  }

  const withStats = ((projects ?? []) as Project[]).map((p) => ({
    ...p,
    total: counts[p.id]?.total ?? 0,
    done: counts[p.id]?.done ?? 0,
  }));

  return <ProjectsView projects={withStats} />;
}

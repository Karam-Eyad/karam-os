import { createClient } from "@/lib/supabase/server";
import { AllTasksView } from "@/components/views/AllTasksView";
import type { TaskWithProject } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("id, name, color").order("created_at"),
    supabase
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .order("status")
      .order("due_date", { nullsFirst: false }),
  ]);

  return (
    <AllTasksView
      tasks={(tasks ?? []) as unknown as TaskWithProject[]}
      projects={projects ?? []}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { TodayView } from "@/components/views/TodayView";
import type { TaskWithProject } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISO();

  const [{ data: profile }, { data: projects }, { data: tasks }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
      supabase.from("projects").select("id, name, color").order("created_at"),
      supabase
        .from("tasks")
        .select("*, project:projects(id, name, color)")
        .lte("due_date", today)
        .order("priority")
        .order("due_date"),
    ]);

  const all = (tasks ?? []) as unknown as TaskWithProject[];
  const overdue = all.filter(
    (x) => x.due_date! < today && x.status !== "done"
  );
  const todays = all.filter((x) => x.due_date === today);

  return (
    <TodayView
      userName={profile?.full_name ?? ""}
      overdue={overdue}
      today={todays}
      projects={projects ?? []}
      todayISO={today}
    />
  );
}

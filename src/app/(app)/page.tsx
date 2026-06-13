import { getServerUser } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { TodayView } from "@/components/views/TodayView";
import type { TaskWithProject, HabitWithLogs } from "@/lib/types";

export const dynamic = "force-dynamic";

function getLast30Days(today: string): string[] {
  const days: string[] = [];
  const base = new Date(today);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function TodayPage() {
  const { supabase, user } = await getServerUser();

  const today = todayISO();
  const thirtyDaysAgo = getLast30Days(today)[0];

  const [
    { data: profile },
    { data: projects },
    { data: tasks },
    { data: habits },
    { data: habitLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
    supabase.from("projects").select("id, name, color").order("created_at"),
    supabase
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .lte("due_date", today)
      .order("priority")
      .order("due_date"),
    supabase.from("habits").select("*").order("sort_order").order("created_at"),
    supabase
      .from("habit_logs")
      .select("*")
      .gte("completed_date", thirtyDaysAgo)
      .lte("completed_date", today),
  ]);

  const all = (tasks ?? []) as unknown as TaskWithProject[];
  const overdue = all.filter(
    (x) => x.due_date! < today && x.status !== "done"
  );
  const todays = all.filter((x) => x.due_date === today);

  const habitsWithLogs: HabitWithLogs[] = (habits ?? []).map((h) => ({
    ...h,
    logs: (habitLogs ?? []).filter((l) => l.habit_id === h.id),
  }));

  return (
    <TodayView
      userName={profile?.full_name ?? ""}
      overdue={overdue}
      today={todays}
      projects={projects ?? []}
      todayISO={today}
      habits={habitsWithLogs}
    />
  );
}

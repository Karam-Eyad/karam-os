import { getServerUser } from "@/lib/supabase/server";
import { addDays, toISODate, todayISO, weekDates } from "@/lib/date";
import { WeekView } from "@/components/views/WeekView";
import type { TaskWithProject } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const sp = await searchParams;
  const offset = Number(sp.w ?? 0) || 0;

  const anchor = addDays(new Date(), offset * 7);
  const days = weekDates(anchor).map(toISODate);
  const start = days[0];
  const end = days[6];

  const { supabase } = await getServerUser();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("id, name, color").order("created_at"),
    supabase
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .gte("due_date", start)
      .lte("due_date", end)
      .order("priority"),
  ]);

  const tasksByDay: Record<string, TaskWithProject[]> = {};
  for (const d of days) tasksByDay[d] = [];
  for (const task of (tasks ?? []) as unknown as TaskWithProject[]) {
    if (task.due_date && tasksByDay[task.due_date])
      tasksByDay[task.due_date].push(task);
  }

  const rangeLabel = `${new Date(start).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })} – ${new Date(end).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })}`;

  return (
    <WeekView
      days={days}
      tasksByDay={tasksByDay}
      projects={projects ?? []}
      offset={offset}
      todayISO={todayISO()}
      rangeLabel={rangeLabel}
    />
  );
}

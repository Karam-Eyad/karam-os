import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { HabitsView } from "@/components/views/HabitsView";
import type { HabitWithLogs } from "@/lib/types";

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

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISO();
  const last30 = getLast30Days(today);
  const thirtyDaysAgo = last30[0];

  const [{ data: habits }, { data: habitLogs }] = await Promise.all([
    supabase.from("habits").select("*").order("sort_order").order("created_at"),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user!.id)
      .gte("completed_date", thirtyDaysAgo)
      .lte("completed_date", today),
  ]);

  const habitsWithLogs: HabitWithLogs[] = (habits ?? []).map((h) => ({
    ...h,
    logs: (habitLogs ?? []).filter((l) => l.habit_id === h.id),
  }));

  // Build chart data: one point per day for the last 30 days
  const chartData = last30.map((date) => {
    const total = habitsWithLogs.length;
    const done = habitsWithLogs.filter((h) =>
      h.logs.some((l) => l.completed_date === date)
    ).length;
    return { date, total, done };
  });

  return (
    <HabitsView
      habits={habitsWithLogs}
      todayISO={today}
      chartData={chartData}
    />
  );
}

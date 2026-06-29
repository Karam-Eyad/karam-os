/**
 * SWR data hooks — read data directly from Supabase in the browser.
 * No Vercel round-trip needed; data is cached per session so navigating
 * between pages is instant after the first load.
 */
import useSWR, { mutate as globalMutate } from "swr";
import { createClient } from "@/lib/supabase/client";
import { todayISO } from "@/lib/date";
import type { HabitWithLogs, Project, SkillWithSessions, TaskWithProject } from "@/lib/types";

// Single shared client instance for the browser session.
const sb = createClient();

// ---------- SWR keys ----------
export const KEYS = {
  tasks: "tasks",
  todayTasks: () => ["today-tasks", todayISO()] as const,
  projects: "projects",
  projectCounts: "project-counts",
  habits: (today: string) => ["habits", today] as const,
  habitChartData: (today: string) => ["habit-chart", today] as const,
  skills: "skills",
  skillDetail: (id: string) => ["skill", id] as const,
} as const;

// Invalidate all task-related caches after any mutation.
export function revalidateTasks() {
  globalMutate("tasks");
  globalMutate(["today-tasks", todayISO()]);
}
export function revalidateProjects() {
  globalMutate("projects");
  globalMutate("project-counts");
  revalidateTasks(); // project names shown in tasks
}
export function revalidateHabits(today: string) {
  globalMutate(["habits", today]);
  globalMutate(["habit-chart", today]);
}
export function revalidateSkills(skillId?: string) {
  globalMutate("skills");
  if (skillId) globalMutate(["skill", skillId]);
}

// ---------- Tasks ----------
export function useTasks() {
  return useSWR<TaskWithProject[]>(KEYS.tasks, async () => {
    const { data } = await sb
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .order("status")
      .order("due_date", { nullsFirst: false })
      .order("created_at", { ascending: false });
    return (data ?? []) as unknown as TaskWithProject[];
  });
}

export function useTodayTasks() {
  const today = todayISO();
  return useSWR<TaskWithProject[]>(KEYS.todayTasks(), async () => {
    const { data } = await sb
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .lte("due_date", today)
      .neq("status", "done")
      .order("priority")
      .order("due_date");
    return (data ?? []) as unknown as TaskWithProject[];
  });
}

export function useCompletedToday() {
  const today = todayISO();
  return useSWR<TaskWithProject[]>(["done-today", today], async () => {
    const { data } = await sb
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .eq("status", "done")
      .gte("completed_at", today + "T00:00:00")
      .lte("completed_at", today + "T23:59:59");
    return (data ?? []) as unknown as TaskWithProject[];
  });
}

// ---------- Projects ----------
export function useProjects() {
  return useSWR<Project[]>(KEYS.projects, async () => {
    const { data } = await sb
      .from("projects")
      .select("*")
      .order("created_at");
    return (data ?? []) as Project[];
  });
}

export function useProjectsWithCounts() {
  return useSWR<{ project: Project; total: number; done: number }[]>(
    KEYS.projectCounts,
    async () => {
      const [{ data: projects }, { data: tasks }] = await Promise.all([
        sb.from("projects").select("*").order("created_at"),
        sb.from("tasks").select("project_id, status"),
      ]);

      const counts: Record<string, { total: number; done: number }> = {};
      for (const tk of tasks ?? []) {
        if (!tk.project_id) continue;
        counts[tk.project_id] ??= { total: 0, done: 0 };
        counts[tk.project_id].total++;
        if (tk.status === "done") counts[tk.project_id].done++;
      }

      return (projects ?? []).map((p) => ({
        project: p as Project,
        total: counts[p.id]?.total ?? 0,
        done: counts[p.id]?.done ?? 0,
      }));
    }
  );
}

// ---------- Habits ----------
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

export function useHabits(today: string) {
  return useSWR<HabitWithLogs[]>(KEYS.habits(today), async () => {
    const thirtyDaysAgo = getLast30Days(today)[0];
    const [{ data: habits }, { data: habitLogs }] = await Promise.all([
      sb.from("habits").select("*").order("sort_order").order("created_at"),
      sb
        .from("habit_logs")
        .select("*")
        .gte("completed_date", thirtyDaysAgo)
        .lte("completed_date", today),
    ]);

    return (habits ?? []).map((h) => ({
      ...h,
      logs: (habitLogs ?? []).filter((l) => l.habit_id === h.id),
    })) as HabitWithLogs[];
  });
}

export function useHabitChartData(today: string) {
  const { data: habits } = useHabits(today);
  const last30 = getLast30Days(today);

  return useSWR<{ date: string; total: number; done: number }[]>(
    habits ? KEYS.habitChartData(today) : null,
    () => {
      return last30.map((date) => {
        const total = (habits ?? []).length;
        const done = (habits ?? []).filter((h) =>
          h.logs.some((l) => l.completed_date === date)
        ).length;
        return { date, total, done };
      });
    },
    { revalidateOnFocus: false }
  );
}

// ---------- Skills ----------
export function useSkills() {
  return useSWR<SkillWithSessions[]>(KEYS.skills, async () => {
    const [{ data: skills }, { data: sessions }] = await Promise.all([
      sb.from("skills").select("*").order("created_at"),
      sb.from("skill_sessions").select("*").order("created_at", { ascending: false }),
    ]);
    return (skills ?? []).map((s) => ({
      ...s,
      sessions: (sessions ?? []).filter((ss) => ss.skill_id === s.id),
    })) as SkillWithSessions[];
  });
}

export function useSkillDetail(id: string) {
  return useSWR<SkillWithSessions>(KEYS.skillDetail(id), async () => {
    const [{ data: skill }, { data: sessions }] = await Promise.all([
      sb.from("skills").select("*").eq("id", id).single(),
      sb.from("skill_sessions").select("*").eq("skill_id", id).order("created_at", { ascending: false }),
    ]);
    if (!skill) throw new Error("not found");
    return { ...skill, sessions: sessions ?? [] } as SkillWithSessions;
  });
}

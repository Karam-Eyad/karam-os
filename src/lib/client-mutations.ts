/**
 * Client-side Supabase mutations — call the DB directly from the browser.
 * No Vercel round-trip: browser → Supabase → done (~50-150ms).
 * RLS policies enforce authorization at the DB layer.
 */
import { createClient } from "@/lib/supabase/client";
import { addDays, toISODate, todayISO } from "@/lib/date";
import { revalidateTasks, revalidateProjects, revalidateHabits } from "@/lib/hooks";
import type { IdeaStatus, Priority, Recurrence, Status } from "@/lib/types";

const sb = createClient();

async function getUserId() {
  const { data: { session } } = await sb.auth.getSession();
  return session?.user?.id ?? null;
}

// ---------- Tasks ----------
export async function clientToggleTask(
  id: string,
  currentStatus: string,
  taskData: {
    title: string;
    description: string | null;
    due_date: string | null;
    priority: Priority;
    recurrence: Recurrence;
    project_id: string | null;
  }
) {
  const becomingDone = currentStatus !== "done";

  await sb
    .from("tasks")
    .update({
      status: becomingDone ? "done" : "todo",
      completed_at: becomingDone ? new Date().toISOString() : null,
    })
    .eq("id", id);

  // Spawn next occurrence for recurring tasks
  if (becomingDone && taskData.recurrence !== "none") {
    const userId = await getUserId();
    if (userId) {
      const base = taskData.due_date ? new Date(taskData.due_date) : new Date();
      const next = addDays(base, taskData.recurrence === "daily" ? 1 : 7);
      const nextDate = toISODate(next);

      const { data: existing } = await sb
        .from("tasks")
        .select("id")
        .eq("user_id", userId)
        .eq("title", taskData.title)
        .eq("recurrence", taskData.recurrence)
        .eq("due_date", nextDate)
        .neq("status", "done")
        .maybeSingle();

      if (!existing) {
        await sb.from("tasks").insert({
          user_id: userId,
          title: taskData.title,
          description: taskData.description,
          due_date: nextDate,
          priority: taskData.priority,
          status: "todo",
          recurrence: taskData.recurrence,
          project_id: taskData.project_id,
        });
      }
    }
  }

  revalidateTasks();
}

export async function clientCreateTask(data: {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: Priority;
  status?: Status;
  recurrence?: Recurrence;
  project_id?: string | null;
  team_id?: string | null;
}) {
  const userId = await getUserId();
  if (!userId) return;
  await sb.from("tasks").insert({
    user_id: userId,
    title: data.title,
    description: data.description ?? null,
    due_date: data.due_date ?? null,
    priority: data.priority ?? "medium",
    status: data.status ?? "todo",
    recurrence: data.recurrence ?? "none",
    project_id: data.project_id ?? null,
    team_id: data.team_id ?? null,
  });
  revalidateTasks();
}

export async function clientUpdateTask(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    due_date?: string | null;
    priority?: Priority;
    status?: Status;
    recurrence?: Recurrence;
    project_id?: string | null;
  }
) {
  await sb.from("tasks").update(data).eq("id", id);
  revalidateTasks();
}

export async function clientDeleteTask(id: string) {
  await sb.from("tasks").delete().eq("id", id);
  revalidateTasks();
}

// ---------- Projects ----------
export async function clientCreateProject(data: {
  name: string;
  track?: string | null;
  color?: string;
  team_id?: string | null;
}) {
  const userId = await getUserId();
  if (!userId) return;
  await sb.from("projects").insert({
    user_id: userId,
    name: data.name,
    track: data.track ?? null,
    color: data.color ?? "#4f46e5",
    team_id: data.team_id ?? null,
  });
  revalidateProjects();
}

export async function clientUpdateProject(
  id: string,
  data: { name: string; track?: string | null; color?: string }
) {
  await sb.from("projects").update(data).eq("id", id);
  revalidateProjects();
}

export async function clientDeleteProject(id: string) {
  await sb.from("projects").delete().eq("id", id);
  revalidateProjects();
}

// ---------- Habits ----------
export async function clientToggleHabitLog(
  habitId: string,
  date: string,
  completed: boolean
) {
  const userId = await getUserId();
  if (!userId) return;

  if (completed) {
    await sb
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("completed_date", date);
  } else {
    await sb.from("habit_logs").upsert({
      habit_id: habitId,
      user_id: userId,
      completed_date: date,
    });
  }
  revalidateHabits(todayISO());
}

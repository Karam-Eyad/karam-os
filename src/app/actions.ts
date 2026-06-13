"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays, toISODate } from "@/lib/date";
import type { IdeaStatus, Priority, Recurrence, Status } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function revalidateApp() {
  revalidatePath("/", "layout");
}

/* ---------- Projects ---------- */

export async function createProject(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("projects").insert({
    user_id: user.id,
    name,
    track: String(formData.get("track") || "").trim() || null,
    color: String(formData.get("color") || "#4f46e5"),
  });
  revalidateApp();
}

export async function updateProject(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  await supabase
    .from("projects")
    .update({
      name: String(formData.get("name") || "").trim(),
      track: String(formData.get("track") || "").trim() || null,
      color: String(formData.get("color") || "#4f46e5"),
    })
    .eq("id", id);
  revalidateApp();
}

export async function deleteProject(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("projects").delete().eq("id", String(formData.get("id")));
  revalidateApp();
}

/* ---------- Tasks ---------- */

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description: String(formData.get("description") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    priority: (String(formData.get("priority") || "medium") as Priority),
    status: (String(formData.get("status") || "todo") as Status),
    recurrence: (String(formData.get("recurrence") || "none") as Recurrence),
    project_id: String(formData.get("project_id") || "") || null,
  });
  revalidateApp();
}

export async function updateTask(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  await supabase
    .from("tasks")
    .update({
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim() || null,
      due_date: String(formData.get("due_date") || "") || null,
      priority: String(formData.get("priority") || "medium") as Priority,
      status: String(formData.get("status") || "todo") as Status,
      recurrence: String(formData.get("recurrence") || "none") as Recurrence,
      project_id: String(formData.get("project_id") || "") || null,
    })
    .eq("id", id);
  revalidateApp();
}

export async function deleteTask(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("tasks").delete().eq("id", String(formData.get("id")));
  revalidateApp();
}

// Toggle status done/undone. When a recurring task is completed,
// spawn the next occurrence (daily/weekly) so the cadence continues.
export async function toggleTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (!task) return;

  const becomingDone = task.status !== "done";

  await supabase
    .from("tasks")
    .update({
      status: becomingDone ? "done" : "todo",
      completed_at: becomingDone ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (becomingDone && task.recurrence !== "none") {
    const base = task.due_date ? new Date(task.due_date) : new Date();
    const next = addDays(base, task.recurrence === "daily" ? 1 : 7);
    // avoid duplicating if a future occurrence already exists
    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", task.title)
      .eq("recurrence", task.recurrence)
      .eq("due_date", toISODate(next))
      .neq("status", "done")
      .maybeSingle();
    if (!existing) {
      await supabase.from("tasks").insert({
        user_id: user.id,
        title: task.title,
        description: task.description,
        due_date: toISODate(next),
        priority: task.priority,
        status: "todo",
        recurrence: task.recurrence,
        project_id: task.project_id,
      });
    }
  }
  revalidateApp();
}

export async function setStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Status;
  await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidateApp();
}

/* ---------- Habits ---------- */

export async function createHabit(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("habits").insert({
    user_id: user.id,
    name,
    icon: String(formData.get("icon") || "target"),
    color: String(formData.get("color") || "#4f46e5"),
    frequency: String(formData.get("frequency") || "daily") as "daily" | "weekly",
  });
  revalidateApp();
}

export async function updateHabit(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  await supabase
    .from("habits")
    .update({
      name: String(formData.get("name") || "").trim(),
      icon: String(formData.get("icon") || "target"),
      color: String(formData.get("color") || "#4f46e5"),
      frequency: String(formData.get("frequency") || "daily") as "daily" | "weekly",
    })
    .eq("id", id);
  revalidateApp();
}

export async function deleteHabit(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("habits").delete().eq("id", String(formData.get("id")));
  revalidateApp();
}

export async function toggleHabitLog(formData: FormData) {
  const { supabase, user } = await requireUser();
  const habit_id = String(formData.get("habit_id"));
  const date = String(formData.get("date")); // YYYY-MM-DD
  const completed = formData.get("completed") === "true";

  if (completed) {
    // delete the log (toggle off)
    await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habit_id)
      .eq("completed_date", date);
  } else {
    // insert log (toggle on)
    await supabase.from("habit_logs").upsert({
      habit_id,
      user_id: user.id,
      completed_date: date,
    });
  }
  revalidateApp();
}

/* ---------- Profile / settings ---------- */

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") || "").trim() || null,
      locale: String(formData.get("locale") || "ar"),
      email_reminders: formData.get("email_reminders") === "on",
    })
    .eq("id", user.id);
  revalidateApp();
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}

/* ---------- Team ---------- */

export async function createTeam(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  // Guard: if the user already belongs to a team, don't create another.
  const { data: already } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1);
  if (already && already.length > 0) {
    revalidateApp();
    return;
  }

  const { data: team, error: teamErr } = await supabase
    .from("teams")
    .insert({ owner_id: user.id, name })
    .select()
    .single();

  if (teamErr || !team) {
    return { error: teamErr?.message ?? "create_failed" };
  }

  // add owner as member
  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
  });
  // generate initial invite token
  await supabase.from("team_invites").insert({
    team_id: team.id,
    created_by: user.id,
  });

  revalidateApp();
}

export async function regenerateInviteToken(formData: FormData) {
  const { supabase, user } = await requireUser();
  const team_id = String(formData.get("team_id"));
  // delete old tokens
  await supabase.from("team_invites").delete().eq("team_id", team_id);
  // create new one
  await supabase.from("team_invites").insert({
    team_id,
    created_by: user.id,
  });
  revalidateApp();
}

export async function joinTeamByToken(token: string) {
  const { supabase, user } = await requireUser();
  const { data: invite } = await supabase
    .from("team_invites")
    .select("team_id")
    .eq("token", token)
    .single();

  if (!invite) return { error: "invalid_token" };

  // check not already a member
  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", invite.team_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("team_members").insert({
      team_id: invite.team_id,
      user_id: user.id,
      role: "editor",
    });
  }
  revalidateApp();
  return { teamId: invite.team_id };
}

export async function removeMember(formData: FormData) {
  const { supabase } = await requireUser();
  const member_id = String(formData.get("member_id"));
  await supabase.from("team_members").delete().eq("id", member_id);
  revalidateApp();
}

export async function createTeamTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const team_id = String(formData.get("team_id"));
  if (!title || !team_id) return;
  await supabase.from("tasks").insert({
    user_id: user.id,
    team_id,
    title,
    description: String(formData.get("description") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    priority: (String(formData.get("priority") || "medium") as Priority),
    status: (String(formData.get("status") || "todo") as Status),
    recurrence: "none" as Recurrence,
    project_id: String(formData.get("project_id") || "") || null,
  });
  revalidateApp();
}

export async function createTeamProject(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const team_id = String(formData.get("team_id"));
  if (!name || !team_id) return;
  await supabase.from("projects").insert({
    user_id: user.id,
    team_id,
    name,
    track: String(formData.get("track") || "").trim() || null,
    color: String(formData.get("color") || "#4f46e5"),
  });
  revalidateApp();
}

/* ---------- Comments ---------- */

export async function addComment(formData: FormData) {
  const { supabase, user } = await requireUser();
  const task_id = String(formData.get("task_id"));
  const content = String(formData.get("content") || "").trim();
  if (!content || !task_id) return;
  await supabase.from("task_comments").insert({
    task_id,
    user_id: user.id,
    content,
  });
  revalidateApp();
}

export async function deleteComment(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase
    .from("task_comments")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidateApp();
}

/* ---------- Ideas ---------- */

export async function createIdea(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("ideas").insert({
    user_id: user.id,
    title,
    body: String(formData.get("body") || "").trim() || null,
    status: "new" as IdeaStatus,
  });
  revalidateApp();
}

export async function deleteIdea(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("ideas").delete().eq("id", String(formData.get("id")));
  revalidateApp();
}

export async function updateIdeaStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as IdeaStatus;
  await supabase.from("ideas").update({ status }).eq("id", id);
  revalidateApp();
}

// Persist the AI suggestion text onto an idea (called after the API returns).
export async function saveIdeaSuggestion(id: string, suggestion: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("ideas")
    .update({ ai_suggestion: suggestion })
    .eq("id", id);
  revalidateApp();
}

// Turn an idea into a project, then mark the idea as done.
export async function convertIdeaToProject(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single();
  if (!idea) return;

  await supabase.from("projects").insert({
    user_id: user.id,
    name: idea.title,
    track: null,
    color: "#4f46e5",
  });
  await supabase
    .from("ideas")
    .update({ status: "done" as IdeaStatus })
    .eq("id", id);
  revalidateApp();
}

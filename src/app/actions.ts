"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays, toISODate } from "@/lib/date";
import type { Priority, Recurrence, Status } from "@/lib/types";

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

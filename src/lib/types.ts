export type Priority = "high" | "medium" | "low";
export type Status = "todo" | "in_progress" | "done";
export type Recurrence = "none" | "daily" | "weekly";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  track: string | null;
  color: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: Status;
  recurrence: Recurrence;
  completed_at: string | null;
  created_at: string;
};

export type TaskWithProject = Task & {
  project: Pick<Project, "id" | "name" | "color"> | null;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  locale: string;
  email_reminders: boolean;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  frequency: "daily" | "weekly";
  sort_order: number;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD
  created_at: string;
};

export type HabitWithLogs = Habit & {
  logs: HabitLog[];
};

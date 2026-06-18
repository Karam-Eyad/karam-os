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
  team_id?: string | null;
  project_id: string | null;
  assignee_id?: string | null;
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
  assignee?: { full_name: string | null; email: string | null } | null;
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

export type Team = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "editor";
  joined_at: string;
  profile?: { full_name: string | null; email: string | null };
};

export type TeamInvite = {
  id: string;
  team_id: string;
  token: string;
  created_by: string;
  created_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null; email: string | null };
};

export type IdeaStatus = "new" | "in_progress" | "done";

export type Idea = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  ai_suggestion: string | null;
  status: IdeaStatus;
  created_at: string;
};

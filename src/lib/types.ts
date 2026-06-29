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

// ---------- Skills ----------
export type Skill = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: string;
};

export type SkillSession = {
  id: string;
  skill_id: string;
  user_id: string;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
};

export type SkillWithSessions = Skill & {
  sessions: SkillSession[];
};

export const SKILL_LEVEL_THRESHOLDS = [0, 10, 25, 50] as const;
export const SKILL_LEVEL_NAMES = {
  ar: ["مبتدئ", "متوسط", "متقدم", "خبير"],
  en: ["Beginner", "Intermediate", "Advanced", "Expert"],
};

export function getSkillLevel(totalSessions: number): number {
  let level = 1;
  for (let i = 1; i < SKILL_LEVEL_THRESHOLDS.length; i++) {
    if (totalSessions >= SKILL_LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getSkillLevelProgress(totalSessions: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = getSkillLevel(totalSessions);
  if (level >= 4) {
    return { level, current: totalSessions - SKILL_LEVEL_THRESHOLDS[3], needed: 0, pct: 100 };
  }
  const from = SKILL_LEVEL_THRESHOLDS[level - 1];
  const to = SKILL_LEVEL_THRESHOLDS[level];
  const current = totalSessions - from;
  const needed = to - from;
  return { level, current, needed, pct: Math.round((current / needed) * 100) };
}

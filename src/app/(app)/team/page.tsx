import { createClient } from "@/lib/supabase/server";
import { TeamView } from "@/components/views/TeamView";
import type {
  Team,
  TeamMember,
  TeamInvite,
  TaskComment,
  TaskWithProject,
  Project,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://karam-os.vercel.app";

  // Find user's team. Use limit(1) instead of maybeSingle so duplicate
  // memberships (e.g. from earlier failed create attempts) don't throw.
  const { data: memberRows } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user!.id)
    .order("joined_at", { ascending: true })
    .limit(1);

  const memberRow = memberRows?.[0] ?? null;

  if (!memberRow) {
    return (
      <TeamView
        team={null}
        members={[]}
        invite={null}
        tasks={[]}
        projects={[]}
        comments={{}}
        currentUserId={user!.id}
        siteUrl={siteUrl}
      />
    );
  }

  const teamId = memberRow.team_id;

  const [
    { data: team },
    { data: membersRaw },
    { data: invite },
    { data: tasks },
    { data: projects },
  ] = await Promise.all([
    supabase.from("teams").select("*").eq("id", teamId).single(),
    supabase
      .from("team_members")
      .select("*, profile:profiles(full_name, email)")
      .eq("team_id", teamId)
      .order("joined_at"),
    supabase
      .from("team_invites")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("*, project:projects(id, name, color)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at"),
  ]);

  // Fetch comments for all tasks
  const taskIds = (tasks ?? []).map((t) => t.id);
  let commentsMap: Record<string, TaskComment[]> = {};

  if (taskIds.length > 0) {
    const { data: allComments } = await supabase
      .from("task_comments")
      .select("*, profile:profiles(full_name, email)")
      .in("task_id", taskIds)
      .order("created_at");

    (allComments ?? []).forEach((c) => {
      if (!commentsMap[c.task_id]) commentsMap[c.task_id] = [];
      commentsMap[c.task_id].push(c as unknown as TaskComment);
    });
  }

  return (
    <TeamView
      team={team as Team}
      members={(membersRaw ?? []) as unknown as TeamMember[]}
      invite={(invite as TeamInvite) ?? null}
      tasks={(tasks ?? []) as unknown as TaskWithProject[]}
      projects={(projects ?? []) as unknown as Project[]}
      comments={commentsMap}
      currentUserId={user!.id}
      siteUrl={siteUrl}
    />
  );
}

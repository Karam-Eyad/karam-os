import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/join/${token}`);
  }

  const { data: invite, error: inviteErr } = await supabase
    .from("team_invites")
    .select("team_id")
    .eq("token", token)
    .maybeSingle();

  if (inviteErr || !invite) {
    redirect("/team?error=invalid_invite");
  }

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

  revalidatePath("/", "layout");
  redirect("/team?joined=1");
}

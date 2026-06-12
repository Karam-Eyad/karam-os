import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinTeamByToken } from "@/app/actions";

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

  // Not logged in → go to login with return URL
  if (!user) {
    redirect(`/login?next=/join/${token}`);
  }

  const result = await joinTeamByToken(token);

  if (result?.error === "invalid_token") {
    redirect("/team?error=invalid_invite");
  }

  redirect("/team?joined=1");
}

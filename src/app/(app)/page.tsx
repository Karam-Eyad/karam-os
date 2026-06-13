import { getServerUser } from "@/lib/supabase/server";
import { TodayView } from "@/components/views/TodayView";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { supabase, user } = await getServerUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  return <TodayView userName={profile?.full_name ?? ""} />;
}

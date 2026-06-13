import { cookies } from "next/headers";
import { getServerUser } from "@/lib/supabase/server";
import { IdeasView } from "@/components/views/IdeasView";
import type { Idea } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const { supabase, user } = await getServerUser();

  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "en" ? "en" : "ar";

  return <IdeasView ideas={(ideas ?? []) as Idea[]} locale={locale} />;
}

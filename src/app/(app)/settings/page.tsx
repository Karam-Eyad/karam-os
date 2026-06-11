import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/views/SettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, locale, email_reminders")
    .eq("id", user!.id)
    .single();

  return (
    <SettingsView
      fullName={profile?.full_name ?? ""}
      email={profile?.email ?? user?.email ?? ""}
      locale={profile?.locale ?? "ar"}
      emailReminders={profile?.email_reminders ?? true}
    />
  );
}

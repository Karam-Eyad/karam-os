import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getServerUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      userName={profile?.full_name ?? ""}
      userEmail={profile?.email ?? user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}

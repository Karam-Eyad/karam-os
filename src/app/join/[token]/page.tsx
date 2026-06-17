import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Status codes returned by the join_team_by_token RPC
type JoinStatus = "joined" | "already_member" | "invalid_token" | "unauthorized";

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

  // Not signed in → bounce to login, come back here after
  if (!user) {
    redirect(`/login?next=/join/${encodeURIComponent(token)}`);
  }

  // Call the SECURITY DEFINER RPC — handles invite lookup + member insert
  // atomically and bypasses any RLS edge cases.
  const { data, error } = await supabase.rpc("join_team_by_token", {
    _token: token,
  });

  // Postgres error (e.g. function not yet deployed) → render a friendly card
  if (error) {
    return <JoinError code="server_error" details={error.message} />;
  }

  const row = (data as { team_id: string | null; status: JoinStatus }[] | null)?.[0];

  if (!row || row.status === "invalid_token") {
    return <JoinError code="invalid_token" />;
  }
  if (row.status === "unauthorized") {
    redirect(`/login?next=/join/${encodeURIComponent(token)}`);
  }

  // joined or already_member → revalidate and route into the team
  revalidatePath("/", "layout");
  redirect(row.status === "joined" ? "/team?joined=1" : "/team");
}

// ─── Error UI ────────────────────────────────────────────────────────────────
function JoinError({
  code,
  details,
}: {
  code: "invalid_token" | "server_error";
  details?: string;
}) {
  const title =
    code === "invalid_token" ? "رابط دعوة غير صالح" : "حدث خطأ بالخادم";
  const desc =
    code === "invalid_token"
      ? "هذا الرابط منتهي أو غير صحيح. اطلب من مدير الفريق رابطاً جديداً."
      : "ما قدرنا نضمّك للفريق الآن. حاول بعد قليل أو راسل المدير.";

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-500">
          ✕
        </div>
        <h1 className="mb-2 text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted">{desc}</p>
        {details && (
          <p className="mt-3 break-all rounded-lg bg-surface-2 p-2 text-[10px] text-muted">
            {details}
          </p>
        )}
        <Link
          href="/team"
          className="mt-6 inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
        >
          العودة لصفحة الفريق
        </Link>
      </div>
    </main>
  );
}

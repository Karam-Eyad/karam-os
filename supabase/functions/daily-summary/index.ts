// Karam OS — daily email summary.
// Triggered by pg_cron once a day. Reads each user's tasks due today and
// emails them via Resend. Runs with the platform-injected service role key,
// so the service_role secret never leaves Supabase.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Task = {
  title: string;
  priority: "high" | "medium" | "low";
  status: string;
  project: { name: string } | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
};

function buildEmail(name: string, tasks: Task[], dateLabel: string) {
  const rows = tasks
    .map(
      (t) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:15px;color:#1c1b19;">
          ${t.title}
          ${t.project ? `<span style="color:#78736a;font-size:13px;"> — ${t.project.name}</span>` : ""}
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:13px;color:#78736a;text-align:left;">
          ${PRIORITY_LABEL[t.priority] ?? ""}
        </td>
      </tr>`
    )
    .join("");

  return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f7f6f3;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e4dd;border-radius:16px;overflow:hidden;">
      <div style="background:#4f46e5;color:#fff;padding:20px 24px;">
        <div style="font-size:18px;font-weight:800;">Karam OS</div>
        <div style="font-size:13px;opacity:.85;">${dateLabel}</div>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#1c1b19;margin:0 0 16px;">أهلاً ${name || ""} 👋، عندك ${tasks.length} مهمة اليوم:</p>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <p style="font-size:13px;color:#78736a;margin:20px 0 0;">يوم موفّق 🌿</p>
      </div>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  // Custom auth: shared secret header set by the pg_cron job.
  const secret = Deno.env.get("CRON_SECRET");
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("email_reminders", true)
    .not("email", "is", null);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddr = Deno.env.get("RESEND_FROM") ?? "Karam OS <onboarding@resend.dev>";

  let sent = 0;
  const results: { email: string; tasks: number; status: string }[] = [];

  for (const p of profiles ?? []) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, priority, status, project:projects(name)")
      .eq("user_id", p.id)
      .eq("due_date", today)
      .neq("status", "done")
      .order("priority");

    if (!tasks || tasks.length === 0) {
      results.push({ email: p.email, tasks: 0, status: "skipped-no-tasks" });
      continue;
    }

    if (!resendKey) {
      results.push({ email: p.email, tasks: tasks.length, status: "no-resend-key" });
      continue;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddr,
        to: p.email,
        subject: `مهامك اليوم — ${dateLabel}`,
        html: buildEmail(p.full_name ?? "", tasks as unknown as Task[], dateLabel),
      }),
    });
    if (res.ok) sent++;
    results.push({
      email: p.email,
      tasks: tasks.length,
      status: res.ok ? "sent" : `error-${res.status}`,
    });
  }

  return new Response(JSON.stringify({ ok: true, sent, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

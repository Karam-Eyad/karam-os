import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 500 });

  const isNvidia = process.env.AI_PROVIDER === "nvidia" || apiKey.startsWith("nvapi-");
  const baseUrl = process.env.AI_BASE_URL || (isNvidia ? "https://integrate.api.nvidia.com/v1" : "https://api.deepseek.com");
  const model = process.env.AI_MODEL || (isNvidia ? "meta/llama-3.1-8b-instruct" : "deepseek-chat");

  let skillName = "", level = 1, levelName = "", totalSessions = 0, recentNotes = "", messages: { role: string; content: string }[] = [], locale: "ar" | "en" = "ar";

  try {
    const json = await req.json();
    skillName = String(json.skillName || "").trim();
    level = Number(json.level) || 1;
    levelName = String(json.levelName || "").trim();
    totalSessions = Number(json.totalSessions) || 0;
    recentNotes = String(json.recentNotes || "").trim();
    messages = Array.isArray(json.messages) ? json.messages : [];
    locale = json.locale === "en" ? "en" : "ar";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!skillName || messages.length === 0) {
    return NextResponse.json({ error: "missing_data" }, { status: 400 });
  }

  const contextAr = `أنت مدرّب خبير ومتحمّس لمهارة "${skillName}". المتعلم حالياً في مستوى ${levelName} (${level}/4) وأجرى ${totalSessions} جلسة تعلّم.${recentNotes ? ` آخر ملاحظاته: ${recentNotes}` : ""} قدّم نصائح عملية وقصيرة، واقترح مشاريع صغيرة مناسبة للمستوى الحالي عند الطلب. اكتب باللغة العربية فقط، بدون إطالة.`;
  const contextEn = `You are an expert and enthusiastic coach for the skill "${skillName}". The learner is currently at ${levelName} level (${level}/4) with ${totalSessions} sessions completed.${recentNotes ? ` Recent notes: ${recentNotes}` : ""} Give concise, practical advice and suggest small projects suited for their level when asked. Reply in English only, keep it short.`;

  const systemPrompt = locale === "ar" ? contextAr : contextEn;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const ac = new AbortController();
    const killer = setTimeout(() => ac.abort(), 50_000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 400,
      }),
      signal: ac.signal,
    }).finally(() => clearTimeout(killer));

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Skills chat AI error", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "ai_error" }, { status: 502 });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    if (!reply) return NextResponse.json({ error: "empty_response" }, { status: 502 });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}

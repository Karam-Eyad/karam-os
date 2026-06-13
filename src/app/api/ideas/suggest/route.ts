import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// AI suggestion endpoint for the Ideas space. Uses DeepSeek (OpenAI-compatible).
// Given an idea title/body, returns a short motivating suggestion in the
// requested language on how to develop and act on the idea.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
  }

  let title = "";
  let body = "";
  let locale: "ar" | "en" = "ar";
  try {
    const json = await req.json();
    title = String(json.title || "").trim();
    body = String(json.body || "").trim();
    locale = json.locale === "en" ? "en" : "ar";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "missing_title" }, { status: 400 });
  }

  const system =
    locale === "ar"
      ? "أنت مرشد إبداعي وعملي. مهمتك مساعدة المستخدم على تطوير فكرته وتحفيزه على البدء. اكتب بالعربية بأسلوب ودود ومباشر. قدّم: (1) جملة تحفيزية قصيرة، (2) 3 إلى 5 خطوات عملية أولى مرقّمة وقابلة للتنفيذ، (3) تحذير قصير من فخ شائع. اجعل الرد موجزاً ومركّزاً (أقل من 180 كلمة) ولا تستخدم عناوين Markdown كبيرة."
      : "You are a creative, practical mentor. Help the user develop their idea and motivate them to start. Write in friendly, direct English. Provide: (1) a short motivating line, (2) 3-5 concrete numbered first steps, (3) a brief warning about a common pitfall. Keep it concise (under 180 words) and avoid large Markdown headers.";

  const userMsg =
    locale === "ar"
      ? `الفكرة: ${title}\n${body ? `التفاصيل: ${body}` : ""}`
      : `Idea: ${title}\n${body ? `Details: ${body}` : ""}`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "deepseek_error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const suggestion =
      data?.choices?.[0]?.message?.content?.trim() || "";
    if (!suggestion) {
      return NextResponse.json({ error: "empty_response" }, { status: 502 });
    }
    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}

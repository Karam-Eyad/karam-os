import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
// AI generations can take 10–30s. Bump the function timeout above the
// 10s default so we don't get killed mid-stream (Vercel Hobby allows 60s).
export const maxDuration = 60;

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

  // The configured key is an NVIDIA NIM key (prefix "nvapi-"), which serves
  // DeepSeek models through NVIDIA's OpenAI-compatible endpoint. Auto-detect
  // by key prefix, but allow explicit overrides via env.
  const isNvidia =
    process.env.AI_PROVIDER === "nvidia" || apiKey.startsWith("nvapi-");
  const baseUrl =
    process.env.AI_BASE_URL ||
    (isNvidia
      ? "https://integrate.api.nvidia.com/v1"
      : "https://api.deepseek.com");
  const model =
    process.env.AI_MODEL ||
    (isNvidia ? "meta/llama-3.1-8b-instruct" : "deepseek-chat");

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
      ? "أنت مرشد عملي. يجب أن تكتب ردك كاملاً باللغة العربية فقط، بغض النظر عن لغة الفكرة. لا تستخدم الإنجليزية أبداً. اكتب بإيجاز (أقل من 120 كلمة): جملة تحفيز قصيرة + 3 خطوات أولى مرقّمة قابلة للتنفيذ + سطر تحذير من فخ شائع. بدون عناوين Markdown."
      : "You are a practical mentor. Always reply in English only, regardless of the input language. Keep it concise (under 120 words): one motivating line + 3 numbered first steps + one short pitfall warning. No Markdown headers.";

  // Reinforce the language in the user turn itself — Llama tends to mirror
  // the input language unless reminded explicitly in the user message too.
  const langReminder =
    locale === "ar" ? "\n\n[اكتب ردك باللغة العربية فقط]" : "\n\n[Reply in English only]";

  const userMsg =
    locale === "ar"
      ? `الفكرة: ${title}\n${body ? `التفاصيل: ${body}` : ""}${langReminder}`
      : `Idea: ${title}\n${body ? `Details: ${body}` : ""}${langReminder}`;

  try {
    // Abort the upstream call before our function's own maxDuration kicks in,
    // so we always return a clean JSON error instead of a Vercel-killed 0.
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
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 350,
      }),
      signal: ac.signal,
    }).finally(() => clearTimeout(killer));

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("AI suggest error", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "ai_error" }, { status: 502 });
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

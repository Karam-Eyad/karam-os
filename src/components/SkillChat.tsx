"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { SendIcon, RefreshIcon } from "@/components/icons";
import { clsx } from "@/lib/clsx";
import { SKILL_LEVEL_NAMES, getSkillLevel } from "@/lib/types";
import type { SkillWithSessions } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string };

export function SkillChat({ skill }: { skill: SkillWithSessions }) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const totalSessions = skill.sessions.length;
  const level = getSkillLevel(totalSessions);
  const levelName = SKILL_LEVEL_NAMES[locale as "ar" | "en"]?.[level - 1] ?? SKILL_LEVEL_NAMES.en[level - 1];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const recentNotes = skill.sessions
        .slice(0, 5)
        .map((s) => s.notes)
        .filter(Boolean)
        .join(" | ");

      const res = await fetch("/api/skills/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skill.name,
          level,
          levelName,
          totalSessions,
          recentNotes: recentNotes || null,
          messages: newMessages,
          locale,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const reply = data?.reply ?? (locale === "ar" ? "حدث خطأ، حاول مرة ثانية." : "An error occurred, please try again.");
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: locale === "ar" ? "حدث خطأ، حاول مرة ثانية." : "An error occurred, please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[500px] flex-col rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <div className="grid h-8 w-8 place-items-center rounded-xl text-lg" style={{ background: skill.color + "22" }}>
          {skill.icon}
        </div>
        <div>
          <p className="text-sm font-bold">{t.skillCoach}</p>
          <p className="text-xs text-muted">{skill.name} · {levelName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted text-center px-4">
              {locale === "ar"
                ? `اسألني أي شيء عن مهارة "${skill.name}" وأنا هنا أساعدك!`
                : `Ask me anything about "${skill.name}" — I'm here to help!`}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-fg rounded-br-sm"
                  : "bg-surface-2 text-foreground rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-2.5 text-sm text-muted">
              <RefreshIcon width={14} height={14} className="animate-spin" />
              {t.thinking}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg hover-lift transition-spring disabled:opacity-60"
          >
            <SendIcon width={16} height={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

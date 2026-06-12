"use client";

import { useState, useTransition, useRef } from "react";
import { addComment, deleteComment } from "@/app/actions";
import { useI18n } from "@/lib/i18n/context";
import { clsx } from "@/lib/clsx";
import { TrashIcon, SendIcon } from "./icons";
import type { TaskComment } from "@/lib/types";

interface CommentSectionProps {
  taskId: string;
  comments: TaskComment[];
  currentUserId: string;
}

function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (locale === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} د`;
    if (hours < 24) return `منذ ${hours} س`;
    return `منذ ${days} ي`;
  }
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function CommentSection({
  taskId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const { t, locale } = useI18n();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const fd = new FormData();
    fd.append("task_id", taskId);
    fd.append("content", text.trim());
    startTransition(async () => {
      await addComment(fd);
      setText("");
      inputRef.current?.focus();
    });
  }

  return (
    <div className="border-t border-border bg-surface-2/60 px-4 py-3">
      <p className="eyebrow mb-2">{t.comments}</p>

      {/* Comments list */}
      <div className="mb-3 space-y-2">
        {comments.length === 0 && (
          <p className="text-xs text-muted">{t.noComments}</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="group flex gap-2 animate-slide-up">
            {/* Avatar */}
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              {(c.profile?.full_name || c.profile?.email || "?")
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold">
                  {c.profile?.full_name || c.profile?.email || "—"}
                  {c.user_id === currentUserId && (
                    <span className="ms-1 font-normal text-muted">
                      ({t.you})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted">
                  {timeAgo(c.created_at, locale)}
                </span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed">{c.content}</p>
            </div>
            {c.user_id === currentUserId && (
              <form action={deleteComment} className="opacity-0 group-hover:opacity-100 transition-base">
                <input type="hidden" name="id" value={c.id} />
                <button
                  aria-label={t.deleteComment}
                  className="grid h-5 w-5 place-items-center rounded text-muted hover:text-red-500 transition-base"
                >
                  <TrashIcon width={12} height={12} />
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder={t.addComment}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className={clsx(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-base",
            text.trim()
              ? "bg-primary text-primary-fg hover-lift"
              : "bg-surface-2 text-muted cursor-not-allowed"
          )}
        >
          <SendIcon width={14} height={14} />
        </button>
      </form>
    </div>
  );
}

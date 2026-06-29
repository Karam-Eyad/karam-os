"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/context";
import { clientCreateSkillSession } from "@/lib/client-mutations";
import { PlayIcon, XIcon } from "@/components/icons";
import { getSkillLevel, getSkillLevelProgress, SKILL_LEVEL_THRESHOLDS } from "@/lib/types";

type Props = {
  skillId: string;
  skillName: string;
  currentSessions: number;
  onLevelUp?: (newLevel: number) => void;
};

export function SkillSessionDialog({ skillId, skillName, currentSessions, onLevelUp }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function close() {
    setOpen(false);
    setDuration(30);
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const prevLevel = getSkillLevel(currentSessions);
      const newTotal = await clientCreateSkillSession({
        skill_id: skillId,
        duration_minutes: duration,
        notes: notes.trim() || null,
      });
      const newLevel = getSkillLevel(newTotal);
      if (newLevel > prevLevel) onLevelUp?.(newLevel);
      close();
    } finally {
      setPending(false);
    }
  }

  const { current, needed } = getSkillLevelProgress(currentSessions);
  const isMaxLevel = currentSessions >= SKILL_LEVEL_THRESHOLDS[3];

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring"
      >
        <PlayIcon width={14} height={14} />
        {t.logSession}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold">{t.logSession}</h2>
              <button onClick={close} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 transition-base">
                <XIcon width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-sm text-muted">{skillName}</p>

              {/* Progress hint */}
              {!isMaxLevel && (
                <div className="rounded-xl border border-border bg-surface p-3 text-xs text-muted">
                  {current + 1} / {needed} {t.nextLevel}
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">{t.sessionDuration}</label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60, 90].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuration(min)}
                      className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-base ${
                        duration === min
                          ? "bg-primary text-primary-fg"
                          : "border border-border bg-surface hover:bg-surface-2"
                      }`}
                    >
                      {min}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">{t.sessionNotes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.sessionNotes}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-surface-2 transition-base">
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-60"
                >
                  {t.saveSession}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

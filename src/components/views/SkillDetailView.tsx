"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { HabitRing } from "@/components/HabitRing";
import { SkillDialog } from "@/components/SkillDialog";
import { SkillSessionDialog } from "@/components/SkillSessionDialog";
import { SkillChat } from "@/components/SkillChat";
import { clientDeleteSkillSession } from "@/lib/client-mutations";
import { TrashIcon, ChevronRightIcon, ClockIcon } from "@/components/icons";
import { useSkillDetail } from "@/lib/hooks";
import { clsx } from "@/lib/clsx";
import {
  getSkillLevelProgress,
  SKILL_LEVEL_NAMES,
  SKILL_LEVEL_THRESHOLDS,
} from "@/lib/types";

const LEVEL_COLORS = ["#64748b", "#3b82f6", "#8b5cf6", "#f59e0b"];

export function SkillDetailView({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const { data: skill, isLoading } = useSkillDetail(id);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);

  if (isLoading)
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-32 rounded-2xl bg-surface-2" />
        <div className="h-64 rounded-2xl bg-surface-2" />
      </div>
    );

  if (!skill)
    return (
      <div className="pt-8 text-center text-sm text-muted">
        <p>المهارة غير موجودة</p>
        <Link href="/skills" className="mt-2 block text-primary">← {t.skills}</Link>
      </div>
    );

  const total = skill.sessions.length;
  const { level, pct, current, needed } = getSkillLevelProgress(total);
  const levelName = SKILL_LEVEL_NAMES[locale as "ar" | "en"]?.[level - 1] ?? SKILL_LEVEL_NAMES.en[level - 1];
  const isMax = level >= 4;

  function handleLevelUp(newLevel: number) {
    const name = SKILL_LEVEL_NAMES[locale as "ar" | "en"]?.[newLevel - 1] ?? SKILL_LEVEL_NAMES.en[newLevel - 1];
    setLevelUpMsg(`${t.levelUp} ${name} 🎉`);
    setTimeout(() => setLevelUpMsg(null), 4000);
  }

  return (
    <div className="animate-rise space-y-6">
      {/* Level up toast */}
      {levelUpMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-pop rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-fg shadow-lg">
          {levelUpMsg}
        </div>
      )}

      {/* Back */}
      <Link href="/skills" className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-base w-fit">
        <ChevronRightIcon width={14} height={14} className="rotate-180" />
        {t.skills}
      </Link>

      {/* Hero card */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <HabitRing percent={pct} size={72} stroke={6} color={LEVEL_COLORS[level - 1]}>
            <span className="text-2xl">{skill.icon}</span>
          </HabitRing>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{skill.name}</h1>
            {skill.description && (
              <p className="mt-1 text-sm text-muted">{skill.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: LEVEL_COLORS[level - 1] }}
              >
                {levelName}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                {total} {t.sessions}
              </span>
            </div>
          </div>
          <SkillDialog skill={skill} open={false} onClose={() => {}} />
        </div>

        {/* Level progress */}
        {!isMax ? (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span>{current}/{needed} {t.sessionsLeft}</span>
              <span>{t.nextLevel}: {SKILL_LEVEL_NAMES[locale as "ar" | "en"]?.[level] ?? SKILL_LEVEL_NAMES.en[level]}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: LEVEL_COLORS[level - 1] }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-amber-500">{t.maxLevel} ⭐</p>
        )}

        {/* Level milestones */}
        <div className="mt-4 flex gap-2">
          {SKILL_LEVEL_THRESHOLDS.map((threshold, i) => {
            const reached = total >= threshold;
            return (
              <div
                key={i}
                className={clsx(
                  "flex-1 rounded-xl border py-2 text-center text-xs font-semibold transition-base",
                  reached
                    ? "border-transparent text-white"
                    : "border-border text-muted"
                )}
                style={reached ? { background: LEVEL_COLORS[i] } : {}}
              >
                {SKILL_LEVEL_NAMES[locale as "ar" | "en"]?.[i] ?? SKILL_LEVEL_NAMES.en[i]}
                <div className="text-[10px] mt-0.5 opacity-80">{threshold}+</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <SkillSessionDialog
            skillId={skill.id}
            skillName={skill.name}
            currentSessions={total}
            onLevelUp={handleLevelUp}
          />
        </div>
      </div>

      {/* Chat */}
      <div>
        <p className="eyebrow mb-3">{t.skillCoach}</p>
        <SkillChat skill={skill} />
      </div>

      {/* Session history */}
      <div>
        <p className="eyebrow mb-3">{t.sessionHistory}</p>
        {skill.sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
            {t.noSessions}
          </div>
        ) : (
          <div className="space-y-2">
            {skill.sessions.map((session) => (
              <div
                key={session.id}
                className="group flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <span className="text-muted mt-0.5">
                  <ClockIcon width={15} height={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {session.duration_minutes}{t.minutesShort}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(session.created_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="mt-1 text-sm text-muted">{session.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => clientDeleteSkillSession(session.id, skill.id)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-base"
                >
                  <TrashIcon width={13} height={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

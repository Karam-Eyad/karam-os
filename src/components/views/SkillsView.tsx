"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { SkillDialog } from "@/components/SkillDialog";
import { HabitRing } from "@/components/HabitRing";
import { SkillsIcon, TrashIcon, EditIcon, ChevronRightIcon } from "@/components/icons";
import { clientDeleteSkill } from "@/lib/client-mutations";
import { useSkills } from "@/lib/hooks";
import { clsx } from "@/lib/clsx";
import {
  getSkillLevel,
  getSkillLevelProgress,
  SKILL_LEVEL_NAMES,
} from "@/lib/types";
import type { SkillWithSessions } from "@/lib/types";

const LEVEL_COLORS = [
  "text-slate-500",
  "text-blue-500",
  "text-violet-500",
  "text-amber-500",
];

export function SkillsView() {
  const { t, locale } = useI18n();
  const { data: skills = [], isLoading } = useSkills();
  const [editingSkill, setEditingSkill] = useState<SkillWithSessions | null>(null);

  if (isLoading)
    return (
      <div className="animate-pulse space-y-3 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-surface-2" />
        ))}
      </div>
    );

  const totalSessions = skills.reduce((sum, s) => sum + s.sessions.length, 0);
  const maxLevel = skills.filter((s) => getSkillLevel(s.sessions.length) >= 4).length;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={t.skills}
        title={t.skills}
        action={<SkillDialog trigger="button" />}
      />
      <p className="-mt-4 mb-6 text-sm text-muted">{t.skillsTagline}</p>

      {/* Stats */}
      {skills.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-4 animate-slide-up stagger-1">
            <p className="text-2xl font-bold tabular-nums">{totalSessions}</p>
            <p className="text-xs font-medium text-muted mt-1">{t.totalSessions}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-4 animate-slide-up stagger-2">
            <p className="text-2xl font-bold tabular-nums">{maxLevel}</p>
            <p className="text-xs font-medium text-muted mt-1">{t.levelExpert}</p>
          </div>
        </div>
      )}

      {/* Skills list */}
      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft">
            <SkillsIcon width={26} height={26} className="text-primary" />
          </div>
          <p className="text-sm text-muted">{t.noSkills}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, i) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={i}
              locale={locale as "ar" | "en"}
              onEdit={() => setEditingSkill(skill)}
            />
          ))}
        </div>
      )}

      {editingSkill && (
        <SkillDialog
          skill={editingSkill}
          open={true}
          onClose={() => setEditingSkill(null)}
        />
      )}
    </div>
  );
}

function SkillCard({
  skill,
  index,
  locale,
  onEdit,
}: {
  skill: SkillWithSessions;
  index: number;
  locale: "ar" | "en";
  onEdit: () => void;
}) {
  const { t } = useI18n();
  const total = skill.sessions.length;
  const { level, pct, current, needed } = getSkillLevelProgress(total);
  const levelName = SKILL_LEVEL_NAMES[locale][level - 1];
  const isMax = level >= 4;

  function handleDelete() {
    if (!confirm(t.deleteSkillConfirm)) return;
    clientDeleteSkill(skill.id);
  }

  return (
    <div
      className={clsx(
        "group relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-base hover:border-border-strong animate-slide-up",
        `stagger-${Math.min(index + 1, 8)}`
      )}
    >
      {/* Progress ring */}
      <div className="shrink-0">
        <HabitRing percent={pct} size={56} stroke={5} color={skill.color}>
          <span className="text-xl">{skill.icon}</span>
        </HabitRing>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold truncate">{skill.name}</p>
          <span
            className={clsx(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
              LEVEL_COLORS[level - 1],
              "bg-surface-2"
            )}
          >
            {levelName}
          </span>
        </div>
        {skill.description && (
          <p className="text-xs text-muted truncate mb-1">{skill.description}</p>
        )}
        <p className="text-xs text-muted">
          {isMax
            ? t.maxLevel
            : `${current}/${needed} ${t.sessionsLeft}`}
          {" · "}
          {total} {t.sessions}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-base shrink-0">
        <button
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 transition-base"
        >
          <EditIcon width={15} height={15} />
        </button>
        <button
          onClick={handleDelete}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-base"
        >
          <TrashIcon width={15} height={15} />
        </button>
      </div>

      {/* Navigate to detail */}
      <Link
        href={`/skills/${skill.id}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={skill.name}
      />
      <ChevronRightIcon width={16} height={16} className="text-muted shrink-0 relative z-10 pointer-events-none" />
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { toggleHabitLog } from "@/app/actions";
import { HabitRing } from "./HabitRing";
import { HabitIconRenderer, FireIcon, TrashIcon, EditIcon } from "./icons";
import { clsx } from "@/lib/clsx";
import type { HabitWithLogs } from "@/lib/types";

function calcStreak(logs: { completed_date: string }[]): number {
  if (!logs.length) return 0;
  const sorted = [...logs]
    .map((l) => l.completed_date)
    .sort()
    .reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);
  for (const dateStr of sorted) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = d;
    } else {
      break;
    }
  }
  return streak;
}

function calcCompletionRate(logs: { completed_date: string }[]): number {
  if (!logs.length) return 0;
  return Math.round((logs.length / 30) * 100);
}

interface HabitItemProps {
  habit: HabitWithLogs;
  todayISO: string;
  onEdit?: (habit: HabitWithLogs) => void;
  onDelete?: (habit: HabitWithLogs) => void;
  className?: string;
}

export function HabitItem({
  habit,
  todayISO,
  onEdit,
  onDelete,
  className,
}: HabitItemProps) {
  const [pending, startTransition] = useTransition();

  const todayLog = habit.logs.find((l) => l.completed_date === todayISO);
  const completedToday = !!todayLog;
  const streak = calcStreak(habit.logs);
  const rate = calcCompletionRate(habit.logs);

  function handleToggle() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("habit_id", habit.id);
      fd.append("date", todayISO);
      fd.append("completed", completedToday ? "true" : "false");
      await toggleHabitLog(fd);
    });
  }

  return (
    <div
      className={clsx(
        "group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5 hover-lift transition-base",
        className
      )}
    >
      {/* Ring */}
      <HabitRing
        percent={completedToday ? 100 : rate}
        size={52}
        stroke={4}
        color={habit.color}
        bg="var(--surface-2)"
      >
        <div
          className={clsx(
            "flex items-center justify-center rounded-full transition-base",
            completedToday ? "scale-110" : "scale-100"
          )}
          style={{ color: habit.color }}
        >
          <HabitIconRenderer icon={habit.icon} width={20} height={20} />
        </div>
      </HabitRing>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            "text-sm font-medium truncate transition-base",
            completedToday && "line-through text-muted"
          )}
        >
          {habit.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2.5">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-orange-500">
              <FireIcon width={12} height={12} />
              {streak}
            </span>
          )}
          <span className="text-xs text-muted">{rate}%</span>
        </div>
      </div>

      {/* Actions - visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-base">
        {onEdit && (
          <button
            onClick={() => onEdit(habit)}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground transition-base"
          >
            <EditIcon width={14} height={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(habit)}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-base"
          >
            <TrashIcon width={14} height={14} />
          </button>
        )}
      </div>

      {/* Complete button */}
      <button
        onClick={handleToggle}
        disabled={pending}
        className={clsx(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-base",
          completedToday
            ? "border-transparent text-white"
            : "border-border bg-transparent text-transparent hover:border-primary/50"
        )}
        style={completedToday ? { background: habit.color } : {}}
        aria-label="toggle habit"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={clsx(
            completedToday ? "animate-bounce-in text-white" : "text-transparent"
          )}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
    </div>
  );
}

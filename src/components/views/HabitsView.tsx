"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { HabitItem } from "@/components/HabitItem";
import { HabitDialog } from "@/components/HabitDialog";
import { HabitCompletionChart } from "@/components/HabitCompletionChart";
import { HabitRing } from "@/components/HabitRing";
import { clientDeleteHabit } from "@/lib/client-mutations";
import { FireIcon, TrendingUpIcon } from "@/components/icons";
import { clsx } from "@/lib/clsx";
import { useHabits, useHabitChartData } from "@/lib/hooks";
import { todayISO } from "@/lib/date";
import type { HabitWithLogs } from "@/lib/types";

function calcGlobalStreak(habits: HabitWithLogs[], todayStr: string): number {
  if (!habits.length) return 0;
  const today = new Date(todayStr);
  let streak = 0;
  let cursor = new Date(today);
  for (let i = 0; i < 365; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const anyDone = habits.some((h) =>
      h.logs.some((l) => l.completed_date === iso)
    );
    if (!anyDone && i > 0) break;
    if (anyDone) streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function HabitsView() {
  const { t } = useI18n();
  const today = todayISO();
  const { data: habits = [], isLoading } = useHabits(today);
  const { data: chartData = [] } = useHabitChartData(today);
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null);

  if (isLoading)
    return (
      <div className="animate-pulse space-y-3 pt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-2" />
        ))}
      </div>
    );

  const todayDone = habits.filter((h) =>
    h.logs.some((l) => l.completed_date === today)
  ).length;
  const todayTotal = habits.length;
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const bestStreak = calcGlobalStreak(habits, today);

  const avgRate =
    habits.length > 0
      ? Math.round(
          habits.reduce((sum, h) => {
            const rate = h.logs.length > 0 ? (h.logs.length / 30) * 100 : 0;
            return sum + rate;
          }, 0) / habits.length
        )
      : 0;

  function handleDelete(habit: HabitWithLogs) {
    if (!confirm(t.deleteHabitConfirm)) return;
    clientDeleteHabit(habit.id);
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={t.habits}
        title={t.habits}
        action={<HabitDialog trigger="button" />}
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {/* Today ring */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-5 animate-slide-up stagger-1">
          <HabitRing percent={todayPct} size={72} stroke={6} color="var(--primary)">
            <span className="text-sm font-bold tabular-nums">{todayPct}%</span>
          </HabitRing>
          <p className="text-xs font-medium text-muted text-center">{t.todayHabits}</p>
        </div>

        {/* Best streak */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-5 animate-slide-up stagger-2">
          <span className="text-orange-500">
            <FireIcon width={24} height={24} />
          </span>
          <p className="text-2xl font-bold tabular-nums">{bestStreak}</p>
          <p className="text-xs font-medium text-muted text-center">{t.bestStreak}</p>
        </div>

        {/* Avg rate */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-5 animate-slide-up stagger-3">
          <span className="text-primary">
            <TrendingUpIcon width={24} height={24} />
          </span>
          <p className="text-2xl font-bold tabular-nums">{avgRate}%</p>
          <p className="text-xs font-medium text-muted text-center">{t.avgRate}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-6 animate-slide-up stagger-4">
          <HabitCompletionChart data={chartData} />
        </div>
      )}

      {/* Habits list */}
      <section>
        <p className="eyebrow mb-3">{t.todayHabits}</p>
        {habits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-14 text-center text-sm text-muted">
            {t.noHabits}
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit, i) => (
              <div
                key={habit.id}
                className={clsx(
                  "animate-slide-up",
                  `stagger-${Math.min(i + 1, 8)}`
                )}
              >
                <HabitItem
                  habit={habit}
                  todayISO={today}
                  onEdit={setEditingHabit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit dialog */}
      {editingHabit && (
        <HabitDialog
          habit={editingHabit}
          open={true}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  );
}

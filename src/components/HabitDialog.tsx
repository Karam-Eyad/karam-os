"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { clientCreateHabit, clientUpdateHabit } from "@/lib/client-mutations";
import { useI18n } from "@/lib/i18n/context";
import { clsx } from "@/lib/clsx";
import { PlusIcon, XIcon, HABIT_ICONS, HabitIconRenderer } from "./icons";
import type { HabitWithLogs } from "@/lib/types";

const PRESET_COLORS = [
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#db2777", // pink
  "#dc2626", // red
  "#ea580c", // orange
  "#ca8a04", // yellow
  "#16a34a", // green
  "#0891b2", // cyan
];

interface HabitDialogProps {
  habit?: HabitWithLogs;
  trigger?: "button" | "inline";
  onClose?: () => void;
  open?: boolean;
}

export function HabitDialog({
  habit,
  trigger = "button",
  onClose,
  open: controlledOpen,
}: HabitDialogProps) {
  const { t } = useI18n();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? "target");
  const [color, setColor] = useState(habit?.color ?? PRESET_COLORS[0]);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(
    habit?.frequency ?? "daily"
  );

  function close() {
    setInternalOpen(false);
    onClose?.();
  }

  function resetForm() {
    if (!habit) {
      setName("");
      setIcon("target");
      setColor(PRESET_COLORS[0]);
      setFrequency("daily");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const data = { name: name.trim(), icon, color, frequency };
    // Close immediately; mutation runs in the background and SWR revalidates.
    if (habit) {
      clientUpdateHabit(habit.id, data);
    } else {
      clientCreateHabit(data);
      resetForm();
    }
    close();
  }

  return (
    <>
      {/* Trigger */}
      {trigger === "button" && !habit && (
        <button
          onClick={() => setInternalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring"
        >
          <PlusIcon width={16} height={16} />
          {t.addHabit}
        </button>
      )}

      {/* Modal — rendered via portal directly on document.body */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={close}
          />
          <div
            className="animate-slide-up relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
            style={{ maxHeight: "calc(100dvh - 2rem)" }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold">
                {habit ? t.editHabit : t.newHabit}
              </h2>
              <button
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 transition-base"
              >
                <XIcon width={16} height={16} />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5">
              {/* Name */}
              <div>
                <label className="eyebrow mb-1.5 block">{t.habitName}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.habitName}
                  required
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-base"
                />
              </div>

              {/* Icon picker */}
              <div>
                <label className="eyebrow mb-1.5 block">{t.habitIcon}</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {Object.entries(HABIT_ICONS).map(([key]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIcon(key)}
                      className={clsx(
                        "grid h-9 w-full place-items-center rounded-lg border transition-base",
                        icon === key
                          ? "border-primary bg-accent-soft text-primary"
                          : "border-border bg-surface-2 text-muted hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      <HabitIconRenderer icon={key} width={16} height={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="eyebrow mb-1.5 block">{t.color}</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={clsx(
                        "h-8 w-8 rounded-full transition-spring",
                        color === c ? "scale-110" : "hover:scale-105"
                      )}
                      style={{
                        background: c,
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="eyebrow mb-1.5 block">{t.recurrence}</label>
                <div className="flex gap-2">
                  {(["daily", "weekly"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={clsx(
                        "flex-1 rounded-lg border py-2 text-sm font-medium transition-base",
                        frequency === f
                          ? "border-primary bg-accent-soft text-primary"
                          : "border-border text-muted hover:bg-surface-2"
                      )}
                    >
                      {f === "daily" ? t.daily : t.weekly}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-surface-2 transition-base"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-60"
                >
                  {t.save}
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

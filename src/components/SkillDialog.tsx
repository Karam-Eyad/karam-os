"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/context";
import { clientCreateSkill, clientUpdateSkill } from "@/lib/client-mutations";
import { PlusIcon, XIcon } from "@/components/icons";
import { clsx } from "@/lib/clsx";
import type { Skill } from "@/lib/types";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

const ICONS = ["🎯", "💻", "📚", "🎨", "🎵", "🏋️", "🧠", "✍️", "📐", "🔬", "🌐", "🎤"];

type Props =
  | { trigger: "button"; skill?: undefined; open?: undefined; onClose?: undefined }
  | { trigger?: undefined; skill: Skill; open: boolean; onClose: () => void };

export function SkillDialog({ trigger, skill, open: openProp, onClose }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState(COLORS[0]);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isOpen = trigger === "button" ? open : (openProp ?? false);

  useEffect(() => {
    if (isOpen && skill) {
      setName(skill.name);
      setDescription(skill.description ?? "");
      setIcon(skill.icon);
      setColor(skill.color);
    }
    if (!isOpen) {
      setName("");
      setDescription("");
      setIcon("🎯");
      setColor(COLORS[0]);
    }
  }, [isOpen, skill]);

  function close() {
    if (trigger === "button") setOpen(false);
    else onClose?.();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    try {
      if (skill) {
        await clientUpdateSkill(skill.id, { name: name.trim(), description: description.trim() || null, icon, color });
      } else {
        await clientCreateSkill({ name: name.trim(), description: description.trim() || null, icon, color });
      }
      close();
    } finally {
      setPending(false);
    }
  }

  if (!mounted) return trigger === "button" ? null : null;

  return (
    <>
      {trigger === "button" && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring"
        >
          <PlusIcon width={16} height={16} />
          {t.newSkill}
        </button>
      )}

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold">{skill ? t.editSkill : t.newSkill}</h2>
              <button onClick={close} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 transition-base">
                <XIcon width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">{t.skillIcon}</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={clsx(
                        "h-10 w-10 rounded-xl text-xl transition-base",
                        icon === ic ? "ring-2 ring-primary bg-accent-soft" : "bg-surface-2 hover:bg-surface"
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">{t.skillName}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.skillName}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">{t.skillDescription}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.skillDescription}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
                />
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">{t.color}</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ background: c }}
                      className={clsx(
                        "h-8 w-8 rounded-full transition-base",
                        color === c ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-surface-2 transition-base">
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={pending || !name.trim()}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-60"
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

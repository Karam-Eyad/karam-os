"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button, Input, Label } from "./ui";
import { PlusIcon, EditIcon } from "./icons";
import { clsx } from "@/lib/clsx";
import { useI18n } from "@/lib/i18n/context";
import { createProject, updateProject } from "@/app/actions";
import type { Project } from "@/lib/types";

const SWATCHES = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
];

export function ProjectDialog({ project }: { project?: Project }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(project?.color ?? SWATCHES[0]);
  const editing = !!project;

  async function handle(formData: FormData) {
    formData.set("color", color);
    if (editing) await updateProject(formData);
    else await createProject(formData);
    setOpen(false);
  }

  return (
    <>
      {editing ? (
        <button
          onClick={() => setOpen(true)}
          aria-label={t.editProject}
          className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <EditIcon width={15} height={15} />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <PlusIcon width={16} height={16} />
          {t.addProject}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t.editProject : t.newProject}
      >
        <form action={handle} className="space-y-3">
          {editing && <input type="hidden" name="id" value={project.id} />}
          <div>
            <Label>{t.projectName}</Label>
            <Input
              name="name"
              defaultValue={project?.name}
              autoFocus
              required
            />
          </div>
          <div>
            <Label>{t.track}</Label>
            <Input name="track" defaultValue={project?.track ?? ""} />
          </div>
          <div>
            <Label>{t.color}</Label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    "h-8 w-8 rounded-full transition",
                    color === c
                      ? "ring-2 ring-offset-2 ring-offset-surface"
                      : "hover:scale-110"
                  )}
                  style={{
                    background: c,
                    boxShadow:
                      color === c ? `0 0 0 2px ${c}` : undefined,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit">{t.save}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

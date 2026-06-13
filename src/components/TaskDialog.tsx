"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button, Input, Textarea, Select, Label } from "./ui";
import { PlusIcon, EditIcon } from "./icons";
import { useI18n } from "@/lib/i18n/context";
import { clientCreateTask, clientUpdateTask } from "@/lib/client-mutations";
import type { Priority, Project, Recurrence, Status, Task } from "@/lib/types";

export function TaskDialog({
  projects,
  task,
  defaultDate,
  trigger,
}: {
  projects: Pick<Project, "id" | "name" | "color">[];
  task?: Task;
  defaultDate?: string;
  trigger?: "button" | "fab" | "inline";
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const editing = !!task;

  function handle(formData: FormData) {
    const data = {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim() || null,
      due_date: String(formData.get("due_date") || "") || null,
      priority: String(formData.get("priority") || "medium") as Priority,
      status: String(formData.get("status") || "todo") as Status,
      recurrence: String(formData.get("recurrence") || "none") as Recurrence,
      project_id: String(formData.get("project_id") || "") || null,
    };
    if (!data.title) return;
    // Close immediately; mutation runs in the background and SWR revalidates.
    setOpen(false);
    if (editing) clientUpdateTask(task.id, data);
    else clientCreateTask(data);
  }

  return (
    <>
      {trigger === "inline" ? (
        <button
          onClick={() => setOpen(true)}
          className="transition-base flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          <PlusIcon width={16} height={16} /> {t.addTask}
        </button>
      ) : editing ? (
        <button
          onClick={() => setOpen(true)}
          aria-label={t.editTask}
          className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <EditIcon width={15} height={15} />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <PlusIcon width={16} height={16} />
          {editing ? t.editTask : t.addTask}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t.editTask : t.newTask}
      >
        <form action={handle} className="space-y-3">
          {editing && <input type="hidden" name="id" value={task.id} />}
          <div>
            <Label>{t.title}</Label>
            <Input
              name="title"
              defaultValue={task?.title}
              autoFocus
              required
              placeholder={t.title}
            />
          </div>
          <div>
            <Label>{t.description}</Label>
            <Textarea
              name="description"
              defaultValue={task?.description ?? ""}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t.dueDate}</Label>
              <Input
                type="date"
                name="due_date"
                defaultValue={task?.due_date ?? defaultDate ?? ""}
              />
            </div>
            <div>
              <Label>{t.priority}</Label>
              <Select name="priority" defaultValue={task?.priority ?? "medium"}>
                <option value="high">{t.high}</option>
                <option value="medium">{t.medium}</option>
                <option value="low">{t.low}</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t.status}</Label>
              <Select name="status" defaultValue={task?.status ?? "todo"}>
                <option value="todo">{t.todo}</option>
                <option value="in_progress">{t.in_progress}</option>
                <option value="done">{t.done}</option>
              </Select>
            </div>
            <div>
              <Label>{t.recurrence}</Label>
              <Select
                name="recurrence"
                defaultValue={task?.recurrence ?? "none"}
              >
                <option value="none">{t.none}</option>
                <option value="daily">{t.daily}</option>
                <option value="weekly">{t.weekly}</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t.project}</Label>
            <Select name="project_id" defaultValue={task?.project_id ?? ""}>
              <option value="">{t.noProject}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
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

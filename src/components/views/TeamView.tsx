"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import { CommentSection } from "@/components/CommentSection";
import {
  createTeam,
  createTeamTask,
  createTeamProject,
  removeMember,
  regenerateInviteToken,
} from "@/app/actions";
import {
  UsersIcon,
  CopyIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  RefreshIcon,
  MessageIcon,
  ProjectsIcon,
  TasksIcon,
} from "@/components/icons";
import { clsx } from "@/lib/clsx";
import type {
  Team,
  TeamMember,
  TeamInvite,
  TaskComment,
  TaskWithProject,
  Project,
} from "@/lib/types";

interface TeamViewProps {
  team: Team | null;
  members: TeamMember[];
  invite: TeamInvite | null;
  tasks: TaskWithProject[];
  projects: Project[];
  comments: Record<string, TaskComment[]>;
  currentUserId: string;
  siteUrl: string;
}

function CreateTeamForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="animate-rise flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
        <UsersIcon width={28} height={28} className="text-primary" />
      </div>
      <h2 className="mb-1 text-xl font-bold">{t.noTeam}</h2>
      <p className="mb-8 text-sm text-muted">{t.createTeam}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => createTeam(fd));
        }}
        className="flex w-full max-w-sm gap-2"
      >
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.teamName}
          required
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-60"
        >
          <PlusIcon width={16} height={16} />
          {t.createTeam}
        </button>
      </form>
    </div>
  );
}

function InviteLinkCard({
  invite,
  teamId,
  siteUrl,
  isOwner,
}: {
  invite: TeamInvite | null;
  teamId: string;
  siteUrl: string;
  isOwner: boolean;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const link = invite ? `${siteUrl}/join/${invite.token}` : "";

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <LinkIcon width={16} height={16} className="text-primary" />
        <p className="text-sm font-semibold">{t.inviteLink}</p>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 min-w-0 truncate rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted outline-none"
        />
        <button
          onClick={copy}
          className={clsx(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-base",
            copied
              ? "bg-emerald-500/15 text-emerald-600"
              : "bg-accent-soft text-primary hover:bg-primary hover:text-primary-fg"
          )}
        >
          {copied ? (
            <CheckIcon width={14} height={14} />
          ) : (
            <CopyIcon width={14} height={14} />
          )}
          {copied ? t.linkCopied : t.copyLink}
        </button>
        {isOwner && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.append("team_id", teamId);
              startTransition(() => regenerateInviteToken(fd));
            }}
          >
            <button
              type="submit"
              disabled={pending}
              title={t.regenerateLink}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted hover:bg-surface-2 transition-base"
            >
              <RefreshIcon width={14} height={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function MembersCard({
  members,
  currentUserId,
  isOwner,
}: {
  members: TeamMember[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <UsersIcon width={16} height={16} className="text-primary" />
        <p className="text-sm font-semibold">
          {t.members} ({members.length})
        </p>
      </div>
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-primary">
              {(m.profile?.full_name || m.profile?.email || "?")
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {m.profile?.full_name || m.profile?.email || "—"}
                {m.user_id === currentUserId && (
                  <span className="ms-1.5 text-xs text-muted">({t.you})</span>
                )}
              </p>
              <p className="text-xs text-muted">
                {m.role === "owner" ? t.owner : t.editor}
              </p>
            </div>
            {isOwner && m.user_id !== currentUserId && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.append("member_id", m.id);
                  startTransition(() => removeMember(fd));
                }}
              >
                <button
                  type="submit"
                  disabled={pending}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-base"
                  title={t.removeMember}
                >
                  <TrashIcon width={13} height={13} />
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickAddTask({
  teamId,
  projects,
}: {
  teamId: string;
  projects: Project[];
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const fd = new FormData();
        fd.append("team_id", teamId);
        fd.append("title", title);
        fd.append("priority", "medium");
        startTransition(async () => {
          await createTeamTask(fd);
          setTitle("");
        });
      }}
      className="flex gap-2"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`${t.addTeamTask}...`}
        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
      />
      <button
        type="submit"
        disabled={pending || !title.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-50"
      >
        <PlusIcon width={15} height={15} />
      </button>
    </form>
  );
}

function QuickAddProject({ teamId }: { teamId: string }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  const colors = ["#4f46e5", "#7c3aed", "#db2777", "#16a34a", "#ea580c", "#0891b2"];
  const [color, setColor] = useState(colors[0]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const fd = new FormData();
        fd.append("team_id", teamId);
        fd.append("name", name);
        fd.append("color", color);
        startTransition(async () => {
          await createTeamProject(fd);
          setName("");
        });
      }}
      className="flex items-center gap-2"
    >
      <div className="flex gap-1">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={clsx(
              "h-5 w-5 rounded-full transition-spring",
              color === c ? "scale-125 ring-2 ring-offset-1 ring-offset-surface" : ""
            )}
            style={{ background: c, outlineColor: c }}
          />
        ))}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`${t.addTeamProject}...`}
        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
      />
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-50"
      >
        <PlusIcon width={15} height={15} />
      </button>
    </form>
  );
}

export function TeamView({
  team,
  members,
  invite,
  tasks,
  projects,
  comments,
  currentUserId,
  siteUrl,
}: TeamViewProps) {
  const { t } = useI18n();
  const [openComments, setOpenComments] = useState<string | null>(null);

  if (!team) return <CreateTeamForm />;

  const isOwner = team.owner_id === currentUserId;
  const priorityColor: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };

  return (
    <div className="animate-rise">
      <PageHeader eyebrow={t.myTeam} title={team.name} />

      {/* Info grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <InviteLinkCard
          invite={invite}
          teamId={team.id}
          siteUrl={siteUrl}
          isOwner={isOwner}
        />
        <MembersCard
          members={members}
          currentUserId={currentUserId}
          isOwner={isOwner}
        />
      </div>

      {/* Projects */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <ProjectsIcon width={16} height={16} className="text-muted" />
          <p className="eyebrow">{t.teamProjects}</p>
        </div>
        {projects.length > 0 && (
          <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const ptasks = tasks.filter((t) => t.project_id === p.id);
              const done = ptasks.filter((t) => t.status === "done").length;
              const pct = ptasks.length > 0 ? Math.round((done / ptasks.length) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className={clsx(
                    "rounded-xl border border-border bg-surface p-4 animate-slide-up",
                    `stagger-${Math.min(i + 1, 5)}`
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: p.color }}
                    />
                    <p className="font-medium text-sm truncate">{p.name}</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: p.color }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {done}/{ptasks.length} · {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <QuickAddProject teamId={team.id} />
      </section>

      {/* Tasks */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <TasksIcon width={16} height={16} className="text-muted" />
          <p className="eyebrow">{t.teamTasks}</p>
        </div>
        <div className="mb-3 space-y-2">
          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
              {t.noTasks}
            </div>
          )}
          {tasks.map((task, i) => {
            const taskComments = comments[task.id] ?? [];
            const isOpen = openComments === task.id;
            const done = task.status === "done";
            return (
              <div
                key={task.id}
                className={clsx(
                  "rounded-xl border border-border bg-surface overflow-hidden animate-slide-up",
                  `stagger-${Math.min(i + 1, 8)}`
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Status dot */}
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: priorityColor[task.priority] }}
                  />
                  <p
                    className={clsx(
                      "flex-1 min-w-0 truncate text-sm font-medium",
                      done && "line-through text-muted"
                    )}
                  >
                    {task.title}
                  </p>
                  {/* Assigned by */}
                  <span className="hidden shrink-0 text-xs text-muted sm:block">
                    {members.find((m) => m.user_id === task.user_id)?.profile
                      ?.full_name ??
                      members.find((m) => m.user_id === task.user_id)?.profile
                        ?.email ??
                      "—"}
                  </span>
                  {/* Comments toggle */}
                  <button
                    onClick={() => setOpenComments(isOpen ? null : task.id)}
                    className={clsx(
                      "flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-base",
                      isOpen
                        ? "bg-accent-soft text-primary"
                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                    )}
                  >
                    <MessageIcon width={13} height={13} />
                    {taskComments.length > 0 && taskComments.length}
                  </button>
                </div>
                {isOpen && (
                  <CommentSection
                    taskId={task.id}
                    comments={taskComments}
                    currentUserId={currentUserId}
                  />
                )}
              </div>
            );
          })}
        </div>
        <QuickAddTask teamId={team.id} projects={projects} />
      </section>
    </div>
  );
}

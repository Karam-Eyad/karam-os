"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/context";
import { PageHeader } from "@/components/PageHeader";
import {
  createIdea,
  deleteIdea,
  updateIdeaStatus,
  saveIdeaSuggestion,
  convertIdeaToProject,
} from "@/app/actions";
import {
  LightbulbIcon,
  PlusIcon,
  TrashIcon,
  ProjectsIcon,
  RefreshIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { clsx } from "@/lib/clsx";
import type { Idea, IdeaStatus } from "@/lib/types";

type Filter = "all" | IdeaStatus;

const STATUS_STYLES: Record<IdeaStatus, string> = {
  new: "bg-accent-soft text-primary",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function IdeasView({
  ideas,
  locale,
}: {
  ideas: Idea[];
  locale: "ar" | "en";
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.allIdeas },
    { key: "new", label: t.statusNew },
    { key: "in_progress", label: t.statusInProgress },
    { key: "done", label: t.statusDone },
  ];

  const visible = ideas.filter((i) => filter === "all" || i.status === filter);

  return (
    <div className="animate-rise">
      <PageHeader eyebrow={t.ideasSpace} title={t.ideas} />
      <p className="-mt-4 mb-6 text-sm text-muted">{t.ideasTagline}</p>

      <NewIdeaForm />

      <div className="mb-5 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              "transition-base rounded-md px-3 py-1.5 text-sm font-medium",
              filter === f.key
                ? "bg-accent-soft text-primary"
                : "text-muted hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft">
            <LightbulbIcon width={26} height={26} className="text-primary" />
          </div>
          <p className="text-sm text-muted">{t.noIdeas}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewIdeaForm() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface py-3.5 text-sm font-semibold text-muted hover:border-primary hover:text-primary transition-base"
      >
        <PlusIcon width={16} height={16} />
        {t.newIdea}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await createIdea(fd);
          setTitle("");
          setOpen(false);
        });
      }}
      className="animate-pop mb-6 space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t.ideaTitle}
        autoFocus
        required
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
      />
      <textarea
        name="body"
        placeholder={t.ideaBody}
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-base"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground transition-base"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-fg hover-lift transition-spring disabled:opacity-60"
        >
          <PlusIcon width={15} height={15} />
          {t.saveIdea}
        </button>
      </div>
    </form>
  );
}

function IdeaCard({ idea, locale }: { idea: Idea; locale: "ar" | "en" }) {
  const { t } = useI18n();
  const [suggestion, setSuggestion] = useState(idea.ai_suggestion);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Language for the AI suggestion — independent of the app UI locale.
  const [suggLocale, setSuggLocale] = useState<"ar" | "en">(locale);

  const statusLabel: Record<IdeaStatus, string> = {
    new: t.statusNew,
    in_progress: t.statusInProgress,
    done: t.statusDone,
  };

  async function getSuggestion() {
    setLoading(true);
    setErr(null);
    // Hard client-side cap so the spinner never hangs forever, even if the
    // serverless function times out or the network drops mid-stream.
    const ac = new AbortController();
    const killer = setTimeout(() => ac.abort(), 55_000);
    try {
      const res = await fetch("/api/ideas/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: idea.title, body: idea.body, locale: suggLocale }),
        signal: ac.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.suggestion) {
        setErr(t.suggestionError);
      } else {
        setSuggestion(data.suggestion);
        await saveIdeaSuggestion(idea.id, data.suggestion);
      }
    } catch {
      setErr(t.suggestionError);
    } finally {
      clearTimeout(killer);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4 transition-base hover:border-border-strong">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{idea.title}</h3>
        <span
          className={clsx(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            STATUS_STYLES[idea.status]
          )}
        >
          {statusLabel[idea.status]}
        </span>
      </div>

      {idea.body && (
        <p className="mb-3 whitespace-pre-wrap text-sm text-muted">{idea.body}</p>
      )}

      {suggestion && (
        <div className="mb-3 rounded-lg border border-border bg-accent-soft/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <LightbulbIcon width={13} height={13} />
            {t.aiSuggestion}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {suggestion}
          </p>
        </div>
      )}

      {err && <p className="mb-2 text-xs text-red-500">{err}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={getSuggestion}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-2 transition-base disabled:opacity-60"
        >
          {loading ? (
            <RefreshIcon width={13} height={13} className="animate-spin" />
          ) : (
            <LightbulbIcon width={13} height={13} className="text-primary" />
          )}
          {loading ? t.thinking : t.getSuggestion}
        </button>

        {/* Language toggle for the suggestion — independent of app locale */}
        <button
          onClick={() => setSuggLocale((l) => (l === "ar" ? "en" : "ar"))}
          disabled={loading}
          title={suggLocale === "ar" ? "Switch to English" : "التبديل للعربية"}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-surface-2 transition-base disabled:opacity-60"
        >
          {suggLocale === "ar" ? "EN" : "عر"}
        </button>

        {idea.status !== "done" && (
          <form action={convertIdeaToProject}>
            <input type="hidden" name="id" value={idea.id} />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-2 transition-base"
            >
              <ProjectsIcon width={13} height={13} />
              {t.convertToProject}
            </button>
          </form>
        )}

        <div className="relative">
          <select
            value={idea.status}
            onChange={(e) => {
              const fd = new FormData();
              fd.set("id", idea.id);
              fd.set("status", e.target.value);
              startTransition(() => updateIdeaStatus(fd));
            }}
            disabled={pending}
            className="cursor-pointer appearance-none rounded-lg border border-border bg-surface ps-2.5 pe-7 py-1.5 text-xs font-semibold leading-none outline-none hover:bg-surface-2 focus:border-primary transition-base disabled:opacity-60"
          >
            <option value="new">{t.statusNew}</option>
            <option value="in_progress">{t.statusInProgress}</option>
            <option value="done">{t.statusDone}</option>
          </select>
          <ChevronDownIcon
            width={12}
            height={12}
            className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>

        <form action={deleteIdea} className="ms-auto">
          <input type="hidden" name="id" value={idea.id} />
          <button
            type="submit"
            aria-label={t.deleteIdea}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-base"
          >
            <TrashIcon width={14} height={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Outer: fixed overlay that scrolls when form is taller than viewport
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Flex wrapper — min-h-full centres the card vertically */}
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <div
          className="animate-pop relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-surface sm:rounded-2xl"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-surface px-6 py-4 sm:rounded-t-2xl">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              aria-label="close"
              className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

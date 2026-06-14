"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
  const portalRef = useRef<HTMLElement | null>(null);

  // Initialise portal target once on the client
  if (typeof document !== "undefined" && !portalRef.current) {
    portalRef.current = document.body;
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !portalRef.current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Card */}
      <div
        className="animate-pop relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        style={{
          boxShadow: "var(--shadow-lg)",
          maxHeight: "calc(100dvh - 2rem)",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="close"
            className="transition-base grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
          >
            ✕
          </button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    portalRef.current
  );
}

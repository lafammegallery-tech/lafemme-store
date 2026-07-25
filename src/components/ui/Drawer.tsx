"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { IconButton } from "./IconButton";
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "start" | "end";
}
/** Slide-in complementary panel with modal semantics and focus restoration. */
export function Drawer({ open, onClose, title, children, side = "end" }: DrawerProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEscapeKey(open, onClose);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 w-[min(90vw,26rem)] overflow-auto border-l border-lf-border bg-lf-surface shadow-lf-card outline-none ${side === "end" ? "right-0" : "left-0"}`}
      >
        <header className="flex items-center justify-between border-b border-lf-border px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <IconButton label="بستن" icon={<span aria-hidden="true">×</span>} onClick={onClose} />
        </header>
        <div className="p-5">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}

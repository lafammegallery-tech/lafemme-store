"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./IconButton";
import { useEscapeKey } from "./hooks/useEscapeKey";
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
}
/** Portal-based modal with dialog semantics, Escape handling, scroll lock, and initial focus. */
export function Modal({ open, onClose, title, children, footer, closeLabel = "بستن" }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useEscapeKey(open, onClose);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-lf-lg border border-lf-border bg-lf-surface shadow-lf-card outline-none animate-lf-slide-up"
      >
        <header className="flex items-center justify-between border-b border-lf-border px-6 py-4">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <IconButton
            label={closeLabel}
            icon={<span aria-hidden="true">×</span>}
            onClick={onClose}
          />
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-lf-border px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

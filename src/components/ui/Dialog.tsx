"use client";
import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}
/** Confirmation dialog built on Modal for consistent accessible behavior. */
export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  destructive,
}: DialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}

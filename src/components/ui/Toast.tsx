"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: "info" | "success" | "error";
}
const ToastContext = createContext<{ push: (toast: Omit<ToastMessage, "id">) => void } | null>(
  null,
);
/** Provider and live region for transient application messages. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const push = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4000);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[120] flex w-[min(90vw,24rem)] flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`rounded-lf-md border bg-lf-surface p-4 shadow-lf-card ${toast.tone === "error" ? "border-lf-danger/50" : toast.tone === "success" ? "border-lf-success/50" : "border-lf-border"}`}
          >
            <strong className="block">{toast.title}</strong>
            {toast.description && (
              <span className="mt-1 block text-sm text-lf-gray">{toast.description}</span>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
/** Accessor for publishing toast messages from client components. */
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

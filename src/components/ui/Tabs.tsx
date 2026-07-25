"use client";
import type { ReactNode } from "react";
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}
/** Controlled tabs with ARIA relationships and keyboard-friendly buttons. */
export function Tabs({
  items,
  activeId,
  onChange,
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const active = items.find((item) => item.id === activeId);
  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-lf-border">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-controls={`panel-${item.id}`}
            aria-selected={activeId === item.id}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold outline-none focus-visible:shadow-lf-focus disabled:opacity-40 ${activeId === item.id ? "border-lf-gold text-lf-gold" : "border-transparent text-lf-gray"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {active && (
        <div
          role="tabpanel"
          id={`panel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
          className="py-5"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}

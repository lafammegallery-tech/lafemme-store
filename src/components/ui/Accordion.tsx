"use client";
import { useState, type ReactNode } from "react";
export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}
/** Disclosure list using native button controls and ARIA-expanded state. */
export function Accordion({
  items,
  allowMultiple = false,
}: {
  items: AccordionItem[];
  allowMultiple?: boolean;
}) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : allowMultiple
          ? [...current, id]
          : [id],
    );
  return (
    <div className="divide-y divide-lf-border rounded-lf-md border border-lf-border">
      {items.map((item) => {
        const expanded = open.includes(item.id);
        return (
          <section key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`accordion-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right font-semibold outline-none focus-visible:shadow-lf-focus"
              >
                <span>{item.title}</span>
                <span aria-hidden="true">{expanded ? "−" : "+"}</span>
              </button>
            </h3>
            <div
              id={`accordion-${item.id}`}
              hidden={!expanded}
              className="px-5 pb-5 text-lf-gray-light"
            >
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}

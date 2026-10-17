"use client";
import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
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
  const prefix = useId();
  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : allowMultiple
          ? [...current, id]
          : [id],
    );
  return (
    <div className="site-accordion" dir="rtl">
      {items.map((item) => {
        const expanded = open.includes(item.id);
        const panelId = `${prefix}-panel-${item.id}`;
        const triggerId = `${prefix}-trigger-${item.id}`;
        return (
          <section className="site-accordion-item" data-open={expanded} key={item.id}>
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="site-accordion-trigger"
              >
                <span>{item.title}</span>
                <span className="site-accordion-indicator">
                  <Icon name="chevron-down" size={18} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              aria-labelledby={triggerId}
              hidden={!expanded}
              className="site-accordion-content"
            >
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}

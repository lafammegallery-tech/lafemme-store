import type { ReactNode } from "react";
/** Reusable empty-content message with optional illustration and action. */
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className="rounded-lf-md border border-dashed border-lf-border p-10 text-center"
      aria-labelledby="empty-title"
    >
      {icon && <div className="mb-4 flex justify-center text-lf-gold">{icon}</div>}
      <h2 id="empty-title" className="text-xl font-bold">
        {title}
      </h2>
      {description && <p className="mx-auto mt-2 max-w-xl text-lf-gray">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}

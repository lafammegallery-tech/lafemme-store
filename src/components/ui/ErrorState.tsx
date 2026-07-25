import type { ReactNode } from "react";
/** Assertive error feedback with an optional recovery action. */
export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section
      role="alert"
      className="rounded-lf-md border border-lf-danger/40 bg-lf-danger/10 p-8 text-center"
    >
      <h2 className="text-xl font-bold text-lf-danger">{title}</h2>
      {description && <p className="mt-2 text-lf-gray-light">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}

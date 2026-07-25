import type { ReactNode } from "react";
import { Card } from "@/components/ui";

/** کارت مشترک فرم‌های ورود، ثبت‌نام و بازیابی رمز عبور. */
export function AuthCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="contact-form mx-auto max-w-[520px] p-8">
      <h2>{title}</h2>
      {children}
      {footer && <div className="mt-5 text-center">{footer}</div>}
    </Card>
  );
}

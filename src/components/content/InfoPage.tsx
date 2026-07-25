import type { ReactNode } from "react";
import { Container, Card } from "@/components/ui";

/** قالب مشترک صفحات محتوایی مانند قوانین، حریم خصوصی و درباره ما. */
export function InfoPage({ children }: { children: ReactNode }) {
  return (
    <section className="py-16">
      <Container>
        <Card className="space-y-6 p-8 leading-8 text-lf-gray-light">{children}</Card>
      </Container>
    </section>
  );
}

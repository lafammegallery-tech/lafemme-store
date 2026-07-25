import { Container } from "@/components/ui";

interface PageHeroProps {
  title: string;
  description?: string;
}

/** این کامپوننت سربرگ مشترک صفحات داخلی را با ظاهر برند نمایش می‌دهد. */
export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <Container>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </Container>
    </section>
  );
}

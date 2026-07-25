import { Container, Skeleton } from "@/components/ui";
/** حالت بارگذاری عمومی App Router برای انتقال نرم‌تر بین صفحات. */
export default function LoadingPage() {
  return (
    <main className="py-20" aria-busy="true">
      <Container>
        <Skeleton className="mb-8 h-20" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </Container>
    </main>
  );
}

type Props = { gold: string; silver: string };

export function LuxuryMarketPanel({ gold, silver }: Props) {
  return (
    <section className="lf-premium-panel grid md:grid-cols-2 gap-6 p-8">
      <div>
        <span className="lf-premium-accent">Gold</span>
        <h3>{gold}</h3>
      </div>
      <div>
        <span className="lf-premium-accent">Silver</span>
        <h3>{silver}</h3>
      </div>
    </section>
  );
}

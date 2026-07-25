import { Container } from "@/components/ui";
import { brandFeatures } from "@/data/home";

/** Brand benefits rendered from typed data while retaining the legacy visual classes. */
export function WhyUsSection() {
  return (
    <section className="why-us" aria-labelledby="why-la-femme-title">
      <Container>
        <div className="section-title">
          <span>WHY LA FEMME</span>
          <h2 id="why-la-femme-title">چرا La Femme؟</h2>
          <p>
            ما فقط شمش نمی‌فروشیم؛
            <br />
            اعتماد، اصالت و کیفیت ارائه می‌کنیم.
          </p>
        </div>

        <div className="features-grid">
          {brandFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

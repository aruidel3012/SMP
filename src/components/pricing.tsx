import type { CSSProperties } from "react";
import { SUBSCRIPTION_PLANS } from "../data/plans";

interface PricingProps {
  onOpenAuth?: () => void;
}

export const Pricing = ({ onOpenAuth }: PricingProps) => {
  return (
    <section className="pricing" id="precios">
      <div className="container">
        <div className="section-head">
          <span className="tag reveal">Precios</span>
          <h2 className="section-title reveal">
            Planes para cada
            <br />
            tipo de empresa
          </h2>
          <p className="section-sub reveal">
            Cuatro planes diseñados para cada etapa de tu empresa: desde el soporte esencial hasta la cobertura total 24/7.
          </p>
        </div>

        <div className="pricing-grid reveal">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={[
                "pricing-card",
                plan.highlighted ? "pricing-card--highlighted" : "",
                plan.type === "one_time" ? "pricing-card--one-time" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ "--plan-color": plan.color } as CSSProperties}
            >
              {plan.badge && <span className="pricing-badge">{plan.badge}</span>}

              <div className="pricing-card__header">
                <h3 className="pricing-card__name">{plan.name}</h3>
                <p className="pricing-card__desc">{plan.description}</p>
              </div>

              <div className="pricing-card__price">
                <span className="pricing-price__currency">€</span>
                <span className="pricing-price__amount">{plan.price}</span>
                <span className="pricing-price__period">/{plan.period}</span>
              </div>

              {plan.type === "one_time" && (
                <p className="pricing-onetime-tag">
                  Pago único · Sin mensualidades
                </p>
              )}

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature} className="pricing-feature">
                    <span className="pricing-feature__check">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`btn pricing-cta ${
                  plan.highlighted ? "btn-primary" : "btn-outline"
                }`}
                onClick={onOpenAuth}
                type="button"
              >
                {plan.type === "one_time" ? "Adquirir ahora" : "Empezar plan"}
                <span className="pricing-cta__arrow">→</span>
              </button>
            </article>
          ))}
        </div>

        <p className="pricing-note reveal">
          Pago seguro · Sin compromiso · Soporte en español · Factura disponible
        </p>
      </div>
    </section>
  );
};

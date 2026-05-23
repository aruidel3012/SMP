import { SUBSCRIPTION_PLANS } from "../../data/plans";
import type { Subscription } from "../../types";
import type { SubscriptionPlan } from "../../types";

type ClientSubscriptionsProps = {
  subscriptions: Subscription[];
  activeSubscriptions: Subscription[];
  handleSubscribe: (planId: string) => void;
  handleCancelSubscription: (id: string) => void;
  subLoading: string | null;
  handleInitiateSubscribe: (plan: SubscriptionPlan) => void;
  downloadCoursePDF: () => void;
};

export function ClientSubscriptions({
  subscriptions,
  activeSubscriptions,
  handleCancelSubscription,
  subLoading,
  handleInitiateSubscribe,
  downloadCoursePDF,
}: ClientSubscriptionsProps) {
  return (
    <div>
      {activeSubscriptions.length > 0 && (
        <div className="client-card" style={{ marginBottom: "1.25rem" }}>
          <h3>Planes activos</h3>
          <div className="client-active-subs-grid">
            {activeSubscriptions.map((sub) => {
              const plan = SUBSCRIPTION_PLANS.find(
                (p) => p.id === sub.planId,
              );
              return (
                <div
                  key={sub._id}
                  className="client-active-sub-card"
                  style={
                    {
                      "--plan-color": plan?.color || "#4da3ff",
                    } as React.CSSProperties
                  }
                >
                  <div className="client-active-sub-card__header">
                    <div>
                      <h4>{sub.planName}</h4>
                      <p>
                        {sub.planType === "one_time"
                          ? "Pago unico"
                          : `€${sub.price}/mes`}
                      </p>
                    </div>
                    <span className="sub-status-badge sub-status-badge--active">
                      Activo
                    </span>
                  </div>
                  <p className="client-active-sub-card__date">
                    Desde:{" "}
                    {new Date(sub.startDate).toLocaleDateString(
                      "es-ES",
                    )}
                  </p>
                  {sub.planType === "subscription" && (
                    <button
                      className="client-btn client-btn--sm"
                      onClick={() =>
                        handleCancelSubscription(sub._id)
                      }
                    >
                      Cancelar suscripcion
                    </button>
                  )}
                  {sub.planId === "learning" && (
                    <button
                      className="client-btn client-btn--sm"
                      onClick={downloadCoursePDF}
                      style={{ borderColor: "#f59e0b", color: "#f59e0b", marginTop: "0.5rem" }}
                    >
                      Curso
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="client-card">
        <h3>
          {activeSubscriptions.length > 0
            ? "Cambiar o anadir plan"
            : "Elige tu plan"}
        </h3>
        <div className="client-plans-grid">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isActive = activeSubscriptions.some(
              (s) => s.planId === plan.id && s.status === "active",
            );
            return (
              <div
                key={plan.id}
                className={`client-plan-card${plan.highlighted ? " client-plan-card--highlighted" : ""}${isActive ? " client-plan-card--active" : ""}`}
                style={
                  {
                    "--plan-color": plan.color,
                  } as React.CSSProperties
                }
              >
                {plan.badge && (
                  <div className="pricing-badge">{plan.badge}</div>
                )}
                <div className="client-plan-card__header">
                  <h4>{plan.name}</h4>
                  <div className="client-plan-price">
                    <span className="client-plan-price__amount">
                      €{plan.price}
                    </span>
                    <span className="client-plan-price__period">
                      /{plan.period}
                    </span>
                  </div>
                </div>
                <ul className="client-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <span>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isActive ? (
                  <div className="client-plan-active-label">
                    ✓ Plan activo
                  </div>
                ) : (
                  <button
                    className={`client-btn client-btn--full${plan.highlighted ? " client-btn--primary" : ""}`}
                    onClick={() => handleInitiateSubscribe(plan)}
                    disabled={subLoading === plan.id}
                  >
                    {subLoading === plan.id ? (
                      <span className="client-spinner" />
                    ) : plan.type === "one_time" ? (
                      "Adquirir"
                    ) : (
                      "Activar plan"
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {subscriptions.filter((s) => s.status === "cancelled").length >
        0 && (
        <div className="client-card" style={{ marginTop: "1.25rem" }}>
          <h3>Historial</h3>
          <div className="client-timeline-list">
            {subscriptions
              .filter((s) => s.status === "cancelled")
              .map((sub) => (
                <div key={sub._id} className="client-timeline-item">
                  <div className="client-timeline-dot" style={{ background: "#6b7280" }} />
                  <div>
                    <p>{sub.planName}</p>
                    <span>
                      Cancelado ·{" "}
                      {sub.endDate
                        ? new Date(sub.endDate).toLocaleDateString(
                            "es-ES",
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

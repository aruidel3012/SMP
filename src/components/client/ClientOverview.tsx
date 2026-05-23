import type { Subscription, Contract } from "../../types";

type ClientOverviewProps = {
  activeSubscriptions: Subscription[];
  activeContracts: Contract[];
  onNavigate?: (path: string) => void;
  downloadCoursePDF: () => void;
};

export function ClientOverview({
  activeSubscriptions,
  activeContracts,
  onNavigate,
  downloadCoursePDF,
}: ClientOverviewProps) {
  return (
    <div className="client-overview">
      <div className="client-card client-overview__hero">
        <span className="client-label">Tu cuenta</span>
        <h3>
          {activeSubscriptions.length > 0
            ? `Plan ${activeSubscriptions[0].planName}`
            : "Sin plan activo"}
        </h3>
        <p>
          Revisa lo contratado, activa una suscripcion o anade
          servicios adicionales cuando lo necesites.
        </p>
        <div className="client-actions">
          <button className="client-btn client-btn--primary" onClick={() => onNavigate?.("/portal/suscripciones")} type="button">
            Contratar plan
          </button>
          <button className="client-btn" onClick={() => onNavigate?.("/portal/contrataciones")} type="button">
            Ver servicios
          </button>
        </div>
      </div>

      <div className="client-card">
        <h3>Contratado ahora</h3>
        <div className="client-timeline-list">
          {activeSubscriptions.map((sub) => (
            <div key={sub._id} className="client-timeline-item">
              <div className="client-timeline-dot green" />
              <div>
                <p>{sub.planName}</p>
                <span>
                  {sub.planType === "one_time"
                    ? "Pago unico"
                    : `€${sub.price}/mes`}
                </span>
                {sub.planId === "learning" && (
                  <button
                    className="client-btn client-btn--sm"
                    onClick={downloadCoursePDF}
                    style={{ marginTop: "0.5rem", borderColor: "#f59e0b", color: "#f59e0b" }}
                  >
                    Curso
                  </button>
                )}
              </div>
            </div>
          ))}
          {activeContracts.map((contract) => (
            <div key={contract._id} className="client-timeline-item">
              <div className="client-timeline-dot blue" />
              <div>
                <p>{contract.serviceName}</p>
                <span>{contract.equipmentCount} equipos</span>
              </div>
            </div>
          ))}
          {activeSubscriptions.length === 0 &&
            activeContracts.length === 0 && (
              <p className="client-empty">
                Todavia no tienes servicios contratados.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

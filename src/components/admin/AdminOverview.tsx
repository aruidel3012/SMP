import type { Contract, Ticket } from "../../types";

type AdminOverviewProps = {
  adminClientCount: number;
  openCount: number;
  progressCount: number;
  activeContracts: Contract[];
  tickets: Ticket[];
  setSelectedTicketId: (id: string) => void;
  onNavigate?: (path: string) => void;
  handleDeleteTicket: (id: string) => void;
  statusLabel: (s: string) => string;
};

export function AdminOverview({
  adminClientCount,
  openCount,
  progressCount,
  activeContracts,
  tickets,
  setSelectedTicketId,
  onNavigate,
  handleDeleteTicket,
  statusLabel,
}: AdminOverviewProps) {
  return (
    <>
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="admin-kpi__label">Clientes</span>
          <strong>{adminClientCount}</strong>
          <p>Correos con actividad registrada.</p>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi__label">Chats abiertos</span>
          <strong>{openCount + progressCount}</strong>
          <p>Tickets pendientes de seguimiento.</p>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi__label">Contratos</span>
          <strong>{activeContracts.length}</strong>
          <p>Servicios adicionales activos.</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__header">
            <h3>Ultimos chats</h3>
            <button className="admin-btn admin-btn--sm" onClick={() => onNavigate?.("/portal/admin/chats")} type="button">
              Ver todos
            </button>
          </div>
          <div className="admin-ticket-list">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket._id}
                className="admin-ticket-item"
                onClick={() => {
                  setSelectedTicketId(ticket._id);
                  onNavigate?.("/portal/admin/chats");
                }}
              >
                <div className="admin-ticket-item__info">
                  <strong>{ticket.title}</strong>
                  <p>{ticket.clientEmail}</p>
                </div>
                <div className="admin-ticket-item__actions">
                  <span style={{ fontSize: "0.68rem", color: ticket.status === "open" ? "#4da3ff" : ticket.status === "in_progress" ? "#ffcf5a" : "#4ade80", textTransform: "capitalize" }}>
                    {statusLabel(ticket.status)}
                  </span>
                  <button
                    className="admin-ticket-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTicket(ticket._id);
                    }}
                    title="Eliminar ticket"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="admin-empty">No hay chats todavia.</p>}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__header">
            <h3>Ultimas contrataciones</h3>
            <button className="admin-btn admin-btn--sm" onClick={() => onNavigate?.("/portal/admin/contrataciones")} type="button">
              Ver todas
            </button>
          </div>
          <div className="admin-timeline-list">
            {activeContracts.slice(0, 4).map((contract) => (
              <div key={contract._id} className="admin-timeline-item">
                <div className="admin-timeline-dot blue" />
                <div>
                  <p>{contract.serviceName}</p>
                  <span>{contract.clientEmail} · {contract.equipmentCount} equipos</span>
                </div>
              </div>
            ))}
            {activeContracts.length === 0 && <p className="admin-empty">Sin contrataciones registradas.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

import { getInitials } from "../../utils/helpers";
import type { Ticket, Message } from "../../types";

type AdminSupportProps = {
  tickets: Ticket[];
  selectedTicketId: string;
  setSelectedTicketId: (id: string) => void;
  messages: Message[];
  chatInput: string;
  setChatInput: (v: string) => void;
  replyTo: Message | null;
  setReplyTo: (v: Message | null) => void;
  email: string;
  selectedTicket: Ticket | null;
  handleStatusChange: (status: Ticket["status"]) => void;
  handleSendMessage: () => void;
  handleDeleteTicket: (id: string) => void;
  chatBoxRef: React.RefObject<HTMLDivElement | null>;
  statusLabel: (s: string) => string;
};

export function AdminSupport({
  tickets,
  selectedTicketId,
  setSelectedTicketId,
  messages,
  chatInput,
  setChatInput,
  replyTo,
  setReplyTo,
  email,
  selectedTicket,
  handleStatusChange,
  handleSendMessage,
  handleDeleteTicket,
  chatBoxRef,
  statusLabel,
}: AdminSupportProps) {
  return (
    <div className="admin-support-grid">
      <div className="admin-ticket-panel">
        <div className="admin-ticket-panel__header">
          <h3>Tickets de clientes</h3>
        </div>
        <div className="admin-ticket-panel__list">
          {tickets.length === 0 && <p className="admin-empty">Sin tickets aun.</p>}
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={`admin-ticket-item${ticket._id === selectedTicketId ? " active" : ""}`}
              style={ticket._id === selectedTicketId ? { borderColor: "var(--admin-blue)", background: "rgba(30, 120, 255, 0.06)" } : {}}
              onClick={() => setSelectedTicketId(ticket._id)}
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
        </div>
      </div>

      <div className="admin-chat-panel">
        <div className="admin-chat-panel__header">
          <h3>Chat en vivo</h3>
          <span>{selectedTicket ? statusLabel(selectedTicket.status) : "Sin ticket"}</span>
        </div>

        {selectedTicket ? (
          <>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--admin-border)" }}>
              <div className="admin-ticket-details">
                <h4>{selectedTicket.title}</h4>
                <p>{selectedTicket.description}</p>
              </div>
              <div className="admin-status-tools">
                <button className="admin-btn admin-btn--sm" onClick={() => handleStatusChange("open")}>Abrir</button>
                <button className="admin-btn admin-btn--sm" onClick={() => handleStatusChange("in_progress")}>En progreso</button>
                <button className="admin-btn admin-btn--sm" onClick={() => handleStatusChange("closed")}>Cerrar</button>
              </div>
            </div>

            <div className="admin-chat-box" ref={chatBoxRef}>
              {messages.length === 0 && <p className="admin-empty">Inicia la conversacion...</p>}
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`admin-chat-message ${message.senderEmail === email ? "mine" : "other"}`}
                >
                  <div className="admin-chat-avatar">
                    {getInitials(message.senderName || message.senderEmail)}
                  </div>
                  <div className="admin-chat-bubble">
                    {message.replyToContent && (
                      <div style={{ borderLeft: "2px solid rgba(77, 163, 255, 0.5)", background: "rgba(77, 163, 255, 0.08)", borderRadius: "6px", padding: "0.3rem 0.45rem", marginBottom: "0.4rem" }}>
                        <strong style={{ display: "block", color: "#cfe2ff", fontSize: "0.65rem", marginBottom: "0.05rem" }}>{message.replyToSenderName || "Mensaje"}</strong>
                        <p style={{ margin: 0, color: "#9fbcdf", fontSize: "0.7rem", lineHeight: 1.3 }}>{message.replyToContent}</p>
                      </div>
                    )}
                    <div className="admin-chat-bubble__meta">
                      <strong>{message.senderEmail === email ? "Tu" : message.senderName || message.senderEmail}</strong>
                      <span>{message.senderRole === "admin" ? "Soporte" : "Cliente"}</span>
                    </div>
                    <p>{message.content}</p>
                    <time>{new Date(message.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</time>
                    <button
                      className="chat-reply-btn"
                      onClick={() => setReplyTo(message)}
                      type="button"
                      style={{ marginTop: "0.15rem", border: "none", background: "none", color: "var(--admin-blue-lt)", fontSize: "0.7rem", padding: 0, cursor: "pointer" }}
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {replyTo && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderTop: "1px solid var(--admin-border)", background: "var(--admin-bg-2)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--admin-t1)", margin: 0 }}>
                  Respondiendo a <strong>{replyTo.senderName || replyTo.senderEmail}</strong>: {replyTo.content.slice(0, 60)}...
                </p>
                <button type="button" onClick={() => setReplyTo(null)} style={{ border: "none", background: "none", color: "var(--admin-blue-lt)", cursor: "pointer" }}>✕</button>
              </div>
            )}

            <div className="admin-chat-compose">
              <input
                placeholder="Escribe un mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className="admin-btn admin-btn--primary" onClick={handleSendMessage}>Enviar</button>
            </div>
          </>
        ) : (
          <p className="admin-empty">Selecciona un ticket para iniciar el chat.</p>
        )}
      </div>
    </div>
  );
}

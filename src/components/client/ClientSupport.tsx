import { getInitials } from "../../utils/helpers";
import type { Ticket, Message } from "../../types";

type ClientSupportProps = {
  tickets: Ticket[];
  selectedTicketId: string;
  setSelectedTicketId: (id: string) => void;
  messages: Message[];
  chatInput: string;
  setChatInput: (v: string) => void;
  replyTo: Message | null;
  setReplyTo: (v: Message | null) => void;
  email: string;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  loading: boolean;
  selectedTicket: Ticket | null;
  handleCreateTicket: () => void;
  handleSendMessage: () => void;
  chatBoxRef: React.RefObject<HTMLDivElement | null>;
  statusLabel: (s: string) => string;
  statusDotClass: (s: string) => string;
};

export function ClientSupport({
  tickets,
  selectedTicketId,
  setSelectedTicketId,
  messages,
  chatInput,
  setChatInput,
  replyTo,
  setReplyTo,
  email,
  title,
  setTitle,
  description,
  setDescription,
  loading,
  selectedTicket,
  handleCreateTicket,
  handleSendMessage,
  chatBoxRef,
  statusLabel,
  statusDotClass,
}: ClientSupportProps) {
  return (
    <div className="client-support-grid">
      <div className="client-card">
        <h3>Abrir ticket</h3>
        <div className="client-form">
          <input
            placeholder="Asunto del problema"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Describe tu incidencia con detalle..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="client-btn client-btn--primary"
            onClick={handleCreateTicket}
            disabled={loading}
          >
            {loading ? (
              <span className="client-spinner" />
            ) : (
              "Abrir ticket"
            )}
          </button>
        </div>
      </div>

      <div className="client-card">
        <h3>Mis tickets</h3>
        <div className="client-ticket-list">
          {tickets.length === 0 && (
            <p className="client-empty">Sin tickets aun.</p>
          )}
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              className={`client-ticket-item${ticket._id === selectedTicketId ? " active" : ""}`}
              onClick={() => setSelectedTicketId(ticket._id)}
            >
              <span
                className={`client-ticket-status-dot ${statusDotClass(ticket.status)}`}
              />
              <div className="client-ticket-item__body">
                <strong>{ticket.title}</strong>
                <p>{statusLabel(ticket.status)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="client-chat-panel">
        <div className="client-chat-panel__header">
          <h3>Chat en vivo</h3>
          <span>
            {selectedTicket
              ? statusLabel(selectedTicket.status)
              : "Sin ticket"}
          </span>
        </div>

        <a
          href="https://anydesk.com/es/downloads"
          target="_blank"
          rel="noopener noreferrer"
          className="client-anydesk-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Soporte Remoto
        </a>

        {selectedTicket ? (
          <>
            <div className="client-chat-box" ref={chatBoxRef}>
              {messages.length === 0 && (
                <p className="client-empty">
                  Inicia la conversacion...
                </p>
              )}
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`client-chat-message ${message.senderRole === "admin" ? "admin" : "client"}${message.senderEmail === email ? " mine" : ""}`}
                >
                  <div className="client-chat-avatar">
                    {getInitials(message.senderName || message.senderEmail)}
                  </div>
                  <div className="client-chat-bubble">
                    {message.replyToContent && (
                      <div className="client-chat-reply-preview">
                        <strong>
                          {message.replyToSenderName || "Mensaje"}
                        </strong>
                        <p>{message.replyToContent}</p>
                      </div>
                    )}
                    <div className="client-chat-bubble__meta">
                      <strong>
                        {message.senderEmail === email
                          ? "Tu"
                          : message.senderName || message.senderEmail}
                      </strong>
                      <span>
                        {message.senderRole === "admin"
                          ? "Soporte"
                          : "Cliente"}
                      </span>
                    </div>
                    <p>{message.content}</p>
                    <time>
                      {new Date(message.createdAt).toLocaleTimeString(
                        "es-ES",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </time>
                    <button
                      className="client-chat-reply-btn"
                      onClick={() => setReplyTo(message)}
                      type="button"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {replyTo && (
              <div className="client-chat-replying">
                <p>
                  Respondiendo a{" "}
                  <strong>
                    {replyTo.senderName || replyTo.senderEmail}
                  </strong>
                  : {replyTo.content.slice(0, 80)}...
                </p>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="client-chat-compose">
              <input
                placeholder="Escribe un mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage()
                }
              />
              <button
                className="client-btn client-btn--primary"
                onClick={handleSendMessage}
              >
                Enviar
              </button>
            </div>
          </>
        ) : (
          <p className="client-empty">
            Selecciona un ticket para iniciar el chat.
          </p>
        )}
      </div>
    </div>
  );
}

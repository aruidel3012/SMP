import { getInitials } from "../../utils/helpers";
import type { DoubtMessage } from "../../types";

type AdminDoubtChatsProps = {
  doubtSessions: { _id: string; senderName: string; lastMessage: string; messageCount: number; createdAt: string }[];
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  doubtMessages: DoubtMessage[];
  doubtReplyContent: string;
  setDoubtReplyContent: (v: string) => void;
  doubtLoading: boolean;
  handleSelectSession: (sessionId: string) => void;
  handleDoubtReply: () => void;
  handleDeleteDoubtMessage: (sessionId: string) => void;
  doubtChatBoxRef: React.RefObject<HTMLDivElement | null>;
};

export function AdminDoubtChats({
  doubtSessions,
  selectedSessionId,
  doubtMessages,
  doubtReplyContent,
  setDoubtReplyContent,
  doubtLoading,
  handleSelectSession,
  handleDoubtReply,
  handleDeleteDoubtMessage,
  doubtChatBoxRef,
}: AdminDoubtChatsProps) {
  return (
    <div className="admin-support-grid">
      <div className="admin-ticket-panel">
        <div className="admin-ticket-panel__header">
          <h3>Consultas de clientes</h3>
        </div>
        <div className="admin-ticket-panel__list">
          {doubtSessions.length === 0 && <p className="admin-empty">No hay consultas todavia.</p>}
          {doubtSessions.map((session) => (
            <div
              key={session._id}
              className={`admin-ticket-item${session._id === selectedSessionId ? " active" : ""}`}
              style={session._id === selectedSessionId ? { borderColor: "var(--admin-blue)", background: "rgba(30, 120, 255, 0.06)" } : {}}
              onClick={() => handleSelectSession(session._id)}
            >
              <div className="admin-ticket-item__info">
                <strong>{session.senderName}</strong>
                <p>{session.lastMessage?.slice(0, 60)}{session.lastMessage?.length > 60 ? "..." : ""}</p>
                <span style={{ fontSize: "0.68rem", color: "var(--admin-t2)", marginTop: "0.15rem", display: "block" }}>
                  {session.messageCount} mensajes
                </span>
              </div>
              <div className="admin-ticket-item__actions">
                <button
                  className="admin-ticket-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDoubtMessage(session._id);
                  }}
                  title="Eliminar sesion"
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
          <h3>Conversacion</h3>
          <span>{selectedSessionId ? "En curso" : "Sin consulta"}</span>
        </div>

        {selectedSessionId ? (
          <>
            <div className="admin-chat-box" ref={doubtChatBoxRef}>
              {doubtMessages.length === 0 && <p className="admin-empty">Cargando mensajes...</p>}
              {doubtMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`admin-chat-message ${msg.isAdmin ? "mine" : "other"}`}
                >
                  <div className="admin-chat-avatar">
                    {getInitials(msg.isAdmin ? "Soporte SMP" : msg.senderName)}
                  </div>
                  <div className="admin-chat-bubble">
                    <div className="admin-chat-bubble__meta">
                      <strong>{msg.isAdmin ? "Tu" : msg.senderName}</strong>
                      <span>{msg.isAdmin ? "Soporte" : "Cliente"}</span>
                    </div>
                    <p>{msg.content}</p>
                    <time>{new Date(msg.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</time>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-chat-compose">
              <input
                placeholder="Escribe tu respuesta..."
                value={doubtReplyContent}
                onChange={(e) => setDoubtReplyContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDoubtReply()}
              />
              <button className="admin-btn admin-btn--primary" onClick={handleDoubtReply} disabled={doubtLoading}>
                {doubtLoading ? "..." : "Enviar"}
              </button>
            </div>
          </>
        ) : (
          <p className="admin-empty">Selecciona una consulta para ver la conversacion.</p>
        )}
      </div>
    </div>
  );
}

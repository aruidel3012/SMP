import { useState, useEffect, useRef } from "react";

type DoubtMessage = {
  _id: string;
  senderName: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
};

const API = (import.meta.env.VITE_API_URL || "https://smp-76gz.onrender.com/api/auth").replace("/auth", "") + "/doubt-chat";

function getSessionId(): string {
  let id = localStorage.getItem("doubtchat_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("doubtchat_session", id);
  }
  return id;
}

function getInitials(value: string) {
  const clean = value.trim();
  if (!clean) return "?";
  const parts = clean.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

export function DoubtChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [name, setName] = useState(() => localStorage.getItem("doubtchat_name") || "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const sessionId = useRef(getSessionId());
  const boxRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API}?sessionId=${encodeURIComponent(sessionId.current)}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) loadMessages();
  }, [open]);

  useEffect(() => {
    if (boxRef.current)
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    if (trimmedName.length < 2 || trimmedContent.length < 3) return;
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName: trimmedName, content: trimmedContent, sessionId: sessionId.current }),
      });
      if (!res.ok) return;
      localStorage.setItem("doubtchat_name", trimmedName);
      setContent("");
      await loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="doubt-chat-fab" onClick={() => setOpen(!open)} aria-label="Chat de dudas">
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="doubt-chat-drawer">
          <div className="doubt-chat-header">
            <h4>Consultas SMP</h4>
            <span>Responde un administrador</span>
          </div>

          <div className="doubt-chat-box" ref={boxRef}>
            {fetching && <p className="doubt-chat-empty">Cargando...</p>}
            {!fetching && messages.length === 0 && (
              <p className="doubt-chat-empty">No hay mensajes aun. ¡Envia tu consulta!</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`doubt-chat-msg ${msg.isAdmin ? "admin" : "user"}`}
              >
                <div className="doubt-chat-avatar">
                  {getInitials(msg.isAdmin ? "Soporte SMP" : msg.senderName)}
                </div>
                <div className="doubt-chat-bubble">
                  <div className="doubt-chat-bubble-meta">
                    <strong>{msg.isAdmin ? "Soporte SMP" : msg.senderName}</strong>
                    <span>{new Date(msg.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="doubt-chat-compose">
            <input
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
            <div className="doubt-chat-row">
              <input
                placeholder="Escribe tu consulta..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                maxLength={500}
              />
              <button onClick={handleSend} disabled={loading || name.trim().length < 2 || content.trim().length < 3}>
                {loading ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
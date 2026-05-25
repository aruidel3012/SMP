import { useState } from "react";
import type { RemoteRepair } from "../../types";

type AdminRepairsProps = {
  repairs: RemoteRepair[];
  handleUpdateRepairStatus: (id: string, status: RemoteRepair["status"], scheduledAt?: string, technicianNotes?: string) => void;
  handleDeleteRepair: (id: string) => void;
  statusLabel: (s: string) => string;
};

const urgencyLabels: Record<string, string> = {
  all: "Todas",
  critical: "Critica",
  high: "Alta",
  normal: "Normal",
};

const deviceLabels: Record<string, string> = {
  pc: "PC",
  laptop: "Portatil",
  server: "Servidor",
  mobile: "Movil",
  network: "Red",
  other: "Otro",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  scheduled: "Programada",
  in_progress: "En curso",
  resolved: "Resuelta",
  cancelled: "Cancelada",
};

const urgencyColors: Record<string, string> = {
  critical: "#ff4757",
  high: "#ffa502",
  normal: "#4ade80",
};

export function AdminRepairs({
  repairs,
  handleUpdateRepairStatus,
  handleDeleteRepair,
}: AdminRepairsProps) {
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editStatusId, setEditStatusId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RemoteRepair["status"]>("pending");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");

  const filtered = filterUrgency === "all"
    ? repairs
    : repairs.filter((r) => r.urgency === filterUrgency);

  const pendingCritical = repairs.filter((r) => r.urgency === "critical" && r.status === "pending").length;

  const handleApplyStatus = (id: string) => {
    handleUpdateRepairStatus(id, editStatus, editDate || undefined, editNotes || undefined);
    setEditStatusId(null);
    setEditNotes("");
    setEditDate("");
  };

  return (
    <div>
      <div className="admin-kpi-grid" style={{ marginBottom: "1rem" }}>
        <div className="admin-kpi-card">
          <span className="admin-kpi__label">Total solicitudes</span>
          <strong>{repairs.length}</strong>
          <p>Reparaciones registradas</p>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi__label">Pendientes</span>
          <strong>{repairs.filter((r) => r.status === "pending").length}</strong>
          <p>Esperando atencion</p>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi__label">Criticas pendientes</span>
          <strong style={{ color: "#ff4757" }}>{pendingCritical}</strong>
          <p>Requieren atencion urgente</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <div className="admin-card__header">
          <h3>Filtrar por urgencia</h3>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["all", "critical", "high", "normal"].map((u) => (
            <button
              key={u}
              className="admin-btn"
              style={{
                borderColor: filterUrgency === u ? urgencyColors[u] || "var(--admin-blue)" : "var(--admin-border)",
                color: filterUrgency === u ? urgencyColors[u] || "var(--admin-blue-lt)" : "var(--admin-t1)",
                background: filterUrgency === u ? `${urgencyColors[u] || "var(--admin-blue)"}15` : "transparent",
              }}
              onClick={() => setFilterUrgency(u)}
            >
              {urgencyLabels[u]}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Solicitudes de reparacion a distancia</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--admin-t2)" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 && (
          <p className="admin-empty" style={{ padding: "2rem" }}>
            No hay solicitudes de reparacion.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {filtered.map((r) => (
            <div
              key={r._id}
              className="admin-ticket-item"
              style={{
                flexDirection: "column",
                alignItems: "stretch",
                cursor: "default",
                borderColor: r.urgency === "critical"
                  ? "rgba(255, 71, 87, 0.3)"
                  : r.urgency === "high"
                    ? "rgba(255, 165, 2, 0.3)"
                    : "var(--admin-border)",
              }}
              onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div className="admin-ticket-item__info">
                  <strong>{r.clientName || r.clientEmail}</strong>
                  <p>{deviceLabels[r.deviceType] || r.deviceType} · {r.issue.slice(0, 60)}{r.issue.length > 60 ? "..." : ""}</p>
                </div>
                <div className="admin-ticket-item__actions">
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontWeight: 600,
                      background: `${urgencyColors[r.urgency]}20`,
                      color: urgencyColors[r.urgency],
                    }}
                  >
                    {urgencyLabels[r.urgency]}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontWeight: 600,
                      background: r.status === "pending"
                        ? "rgba(77, 163, 255, 0.15)"
                        : r.status === "resolved"
                          ? "rgba(74, 222, 128, 0.15)"
                          : r.status === "cancelled"
                            ? "rgba(255, 107, 107, 0.15)"
                            : "rgba(255, 165, 2, 0.15)",
                      color: r.status === "pending"
                        ? "#4da3ff"
                        : r.status === "resolved"
                          ? "#4ade80"
                          : r.status === "cancelled"
                            ? "#ff6b6b"
                            : "#ffa502",
                    }}
                  >
                    {statusLabels[r.status]}
                  </span>
                </div>
              </div>

              {expandedId === r._id && (
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--admin-border)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "var(--admin-t2)", margin: "0 0 0.2rem" }}>Cliente</p>
                      <p style={{ fontSize: "0.82rem", color: "var(--admin-t0)", margin: 0 }}>{r.clientName || "—"}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--admin-t1)", margin: 0 }}>{r.clientEmail}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "var(--admin-t2)", margin: "0 0 0.2rem" }}>Dispositivo</p>
                      <p style={{ fontSize: "0.82rem", color: "var(--admin-t0)", margin: 0 }}>{deviceLabels[r.deviceType] || r.deviceType}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ fontSize: "0.7rem", color: "var(--admin-t2)", margin: "0 0 0.2rem" }}>Problema</p>
                    <p style={{ fontSize: "0.82rem", color: "var(--admin-t1)", margin: 0, lineHeight: 1.5 }}>{r.issue}</p>
                  </div>

                  {r.technicianNotes && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <p style={{ fontSize: "0.7rem", color: "var(--admin-t2)", margin: "0 0 0.2rem" }}>Notas del tecnico</p>
                      <p style={{ fontSize: "0.82rem", color: "var(--admin-t1)", margin: 0, lineHeight: 1.5 }}>{r.technicianNotes}</p>
                    </div>
                  )}

                  <div style={{ fontSize: "0.7rem", color: "var(--admin-t2)", marginBottom: "0.75rem" }}>
                    Creada: {new Date(r.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {editStatusId === r._id ? (
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", width: "100%" }}>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as RemoteRepair["status"])}
                          style={{
                            padding: "0.4rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-bg-2)",
                            color: "var(--admin-t0)",
                            fontSize: "0.78rem",
                          }}
                        >
                          {Object.entries(statusLabels).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          style={{
                            padding: "0.4rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-bg-2)",
                            color: "var(--admin-t0)",
                            fontSize: "0.78rem",
                          }}
                          placeholder="Programar fecha"
                        />
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notas del tecnico..."
                          style={{
                            padding: "0.4rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-bg-2)",
                            color: "var(--admin-t0)",
                            fontSize: "0.78rem",
                            flex: 1,
                            minWidth: "150px",
                          }}
                        />
                        <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => handleApplyStatus(r._id)}>
                          Aplicar
                        </button>
                        <button className="admin-btn admin-btn--sm" onClick={() => setEditStatusId(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="admin-btn admin-btn--sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditStatusId(r._id);
                            setEditStatus(r.status);
                            setEditDate("");
                            setEditNotes(r.technicianNotes || "");
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Cambiar estado
                        </button>
                        <button
                          className="admin-btn admin-btn--sm"
                          style={{ color: "#ff6b6b" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRepair(r._id);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
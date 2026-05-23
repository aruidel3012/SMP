import type { RemoteRepair } from "../../types";

type ClientRepairProps = {
  repairs: RemoteRepair[];
  handleSendRepair: () => void;
  handleCancelRepair: (id: string) => void;
  loading: boolean;
  repairDevice: string;
  setRepairDevice: (v: string) => void;
  repairIssue: string;
  setRepairIssue: (v: string) => void;
  repairUrgency: "normal" | "high" | "critical";
  setRepairUrgency: (v: "normal" | "high" | "critical") => void;
};

export function ClientRepair({
  repairs,
  handleSendRepair,
  handleCancelRepair,
  loading,
  repairDevice,
  setRepairDevice,
  repairIssue,
  setRepairIssue,
  repairUrgency,
  setRepairUrgency,
}: ClientRepairProps) {
  return (
    <div className="client-repair-grid">
      <div className="client-card">
        <h3>Solicitar reparacion a distancia</h3>
        <p>
          Un tecnico se conectara remotamente a tu equipo para diagnosticar y resolver el problema.
        </p>
        <div className="client-form">
          <div className="fgroup">
            <label>Tipo de dispositivo</label>
            <select value={repairDevice} onChange={(e) => setRepairDevice(e.target.value)}>
              <option value="pc">PC de escritorio</option>
              <option value="laptop">Portatil / Laptop</option>
              <option value="server">Servidor</option>
              <option value="mobile">Movil / Tablet</option>
              <option value="network">Red / Router</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="fgroup">
            <label>Urgencia</label>
            <div className="client-urgency-tabs">
              {(["normal", "high", "critical"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`client-urgency-tab client-urgency-tab--${u}${repairUrgency === u ? " active" : ""}`}
                  onClick={() => setRepairUrgency(u)}
                >
                  {u === "normal" ? "Normal" : u === "high" ? "Alta" : "Critica"}
                </button>
              ))}
            </div>
          </div>
          <div className="fgroup">
            <label>Describe el problema</label>
            <textarea
              placeholder="Explica con detalle que ocurre, cuando empezo y que has probado..."
              value={repairIssue}
              onChange={(e) => setRepairIssue(e.target.value)}
              rows={5}
            />
          </div>
          <button className="client-btn client-btn--primary" onClick={handleSendRepair} disabled={loading}>
            {loading ? <span className="client-spinner" /> : "Enviar solicitud"}
          </button>
        </div>
      </div>

      <div className="client-card">
        <h3>Mis solicitudes</h3>
        {repairs.length === 0 && (
          <p className="client-empty">No tienes solicitudes de reparacion.</p>
        )}
        <div className="client-repair-list">
          {repairs.map((r) => (
            <div key={r._id} className="client-repair-item">
              <div className="client-repair-item__head">
                <span className={`client-repair-badge client-repair-badge--${r.urgency}`}>
                  {r.urgency === "critical" ? "Critica" : r.urgency === "high" ? "Alta" : "Normal"}
                </span>
                <span className="client-repair-status">
                  {r.status === "pending" ? "Pendiente" : r.status === "scheduled" ? "Programada" : r.status === "in_progress" ? "En curso" : r.status === "resolved" ? "Resuelta" : "Cancelada"}
                </span>
              </div>
              <p className="client-repair-item__device">
                {r.deviceType === "pc" ? "PC" : r.deviceType === "laptop" ? "Portatil" : r.deviceType === "server" ? "Servidor" : r.deviceType === "mobile" ? "Movil" : r.deviceType === "network" ? "Red" : "Otro"}
              </p>
              <p className="client-repair-item__issue">{r.issue}</p>
              {r.technicianNotes && (
                <p className="client-repair-item__notes">{r.technicianNotes}</p>
              )}
              <div className="client-repair-item__footer">
                <time>{new Date(r.createdAt).toLocaleDateString("es-ES")}</time>
                {r.status === "pending" && (
                  <button
                    className="client-btn client-btn--sm"
                    onClick={() => handleCancelRepair(r._id)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

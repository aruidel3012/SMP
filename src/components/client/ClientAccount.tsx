import { SUBSCRIPTION_PLANS } from "../../data/plans";
import type { Profile } from "../../types";

type ClientAccountProps = {
  profile: Profile | null;
  accountName: string;
  setAccountName: (v: string) => void;
  accountType: "empresa" | "particular";
  setAccountType: (v: "empresa" | "particular") => void;
  handleSaveAccount: () => void;
  deleteStep: "idle" | "code-sent" | "confirming";
  setDeleteStep: (v: "idle" | "code-sent" | "confirming") => void;
  deleteCode: string;
  setDeleteCode: (v: string) => void;
  deleteLoading: boolean;
  handleRequestDelete: () => void;
  handleConfirmDelete: () => void;
  email: string;
};

export function ClientAccount({
  profile,
  accountName,
  setAccountName,
  accountType,
  setAccountType,
  handleSaveAccount,
  deleteStep,
  setDeleteStep,
  deleteCode,
  setDeleteCode,
  deleteLoading,
  handleRequestDelete,
  handleConfirmDelete,
  email,
}: ClientAccountProps) {
  return (
    <div className="client-account-grid">
      <div className="client-card">
        <h3>Perfil de cuenta</h3>
        <div className="client-form">
          <div className="fgroup">
            <label>Nombre</label>
            <input
              placeholder="Tu nombre"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div className="fgroup">
            <label>Tipo de cuenta</label>
            <select
              value={accountType}
              onChange={(e) =>
                setAccountType(
                  e.target.value as "empresa" | "particular",
                )
              }
            >
              <option value="particular">Particular</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>
          <div className="fgroup">
            <label>Email</label>
            <input value={profile?.email || email} disabled />
          </div>
          <div className="fgroup">
            <label>Plan activo</label>
            <input
              value={
                profile?.subscriptionPlan
                  ? SUBSCRIPTION_PLANS.find(
                      (p) => p.id === profile.subscriptionPlan,
                    )?.name || profile.subscriptionPlan
                  : "Ninguno"
              }
              disabled
            />
          </div>
          <button
            className="client-btn client-btn--primary"
            onClick={handleSaveAccount}
          >
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="client-card" style={{ borderColor: "rgba(255, 107, 107, 0.2)" }}>
        <h3 style={{ color: "#ff6b6b" }}>Eliminar cuenta</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--t2)", marginBottom: "1rem" }}>
          Esta accion eliminara permanentemente tu cuenta, suscripciones, tickets y todos tus datos asociados.
        </p>

        {deleteStep === "idle" && (
          <button
            className="client-btn"
            style={{ background: "rgba(255, 107, 107, 0.15)", color: "#ff6b6b", border: "1px solid rgba(255, 107, 107, 0.3)" }}
            onClick={handleRequestDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <span className="client-spinner" /> : "Solicitar eliminacion"}
          </button>
        )}

        {deleteStep === "code-sent" && (
          <div className="client-form">
            <div className="fgroup">
              <label>Codigo de verificacion</label>
              <input
                placeholder="Introduce el codigo de 6 digitos"
                value={deleteCode}
                onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="client-btn client-btn--primary"
                style={{ background: "#ff6b6b" }}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? <span className="client-spinner" /> : "Confirmar eliminacion"}
              </button>
              <button
                className="client-btn"
                onClick={() => { setDeleteStep("idle"); setDeleteCode(""); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

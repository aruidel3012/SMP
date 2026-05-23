import type { RegisteredUser, Subscription, Contract } from "../../types";

type AdminUsersProps = {
  registeredUsers: RegisteredUser[];
  subscriptions: Subscription[];
  contracts: Contract[];
  selectedUserEmail: string;
  setSelectedUserEmail: (v: string) => void;
  handleAdminCancelSubscription: (id: string) => void;
  handleAdminCancelContract: (id: string) => void;
  handleAdminDeleteUser: (id: string, name: string) => void;
};

export function AdminUsers({
  registeredUsers,
  subscriptions,
  contracts,
  selectedUserEmail,
  setSelectedUserEmail,
  handleAdminCancelSubscription,
  handleAdminCancelContract,
  handleAdminDeleteUser,
}: AdminUsersProps) {
  return (
    <div className="admin-grid">
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Usuarios registrados</h3>
        </div>
        <div className="admin-ticket-list">
          {registeredUsers.map((user) => {
            const isSelected = selectedUserEmail === user.email;
            const userSubscriptions = subscriptions.filter(
              (s) => s.clientEmail === user.email && s.status === "active"
            );
            const userContracts = contracts.filter(
              (c) => c.clientEmail === user.email && c.status === "active"
            );
            return (
              <div key={user._id}>
                <div
                  className={`admin-ticket-item${isSelected ? " active" : ""}`}
                  style={isSelected ? { borderColor: "var(--admin-blue)", background: "rgba(30, 120, 255, 0.06)" } : {}}
                  onClick={() =>
                    setSelectedUserEmail(isSelected ? "" : user.email)
                  }
                >
                  <div className="admin-ticket-item__info">
                    <strong>{user.name || "Sin nombre"}</strong>
                    <p>{user.email}</p>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--admin-t1)" }}>
                    {user.subscriptionStatus || "sin plan"}
                  </span>
                </div>
                {isSelected && (
                  <div style={{ padding: "0.5rem 0.75rem 0.75rem", borderBottom: "1px solid var(--admin-border)" }}>
                    {(userSubscriptions.length > 0 || userContracts.length > 0) ? (
                      <>
                        {userSubscriptions.map((sub) => (
                          <div key={sub._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", gap: "0.5rem" }}>
                            <div>
                              <span style={{ fontSize: "0.8rem", color: "var(--admin-t0)", fontWeight: 600 }}>{sub.planName}</span>
                              <span style={{ fontSize: "0.7rem", color: "var(--admin-t2)", marginLeft: "0.5rem" }}>
                                {sub.planType === "one_time" ? "Pago unico" : `€${sub.price}/mes`}
                              </span>
                            </div>
                            <button
                              className="admin-btn admin-btn--sm"
                              style={{ color: "#ff6b6b", borderColor: "rgba(255,107,107,0.3)", flexShrink: 0 }}
                              onClick={() => handleAdminCancelSubscription(sub._id)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ))}
                        {userContracts.map((ctr) => (
                          <div key={ctr._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", gap: "0.5rem" }}>
                            <div>
                              <span style={{ fontSize: "0.8rem", color: "var(--admin-t0)", fontWeight: 600 }}>{ctr.serviceName}</span>
                              <span style={{ fontSize: "0.7rem", color: "var(--admin-t2)", marginLeft: "0.5rem" }}>
                                {ctr.equipmentCount} equipos
                              </span>
                            </div>
                            <button
                              className="admin-btn admin-btn--sm"
                              style={{ color: "#ff6b6b", borderColor: "rgba(255,107,107,0.3)", flexShrink: 0 }}
                              onClick={() => handleAdminCancelContract(ctr._id)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p style={{ fontSize: "0.75rem", color: "var(--admin-t2)", margin: "0 0 0.5rem" }}>
                        Sin planes ni servicios activos.
                      </p>
                    )}
                    <button
                      className="admin-btn admin-btn--sm"
                      style={{ color: "#ff6b6b", borderColor: "rgba(255,107,107,0.3)", marginTop: "0.25rem" }}
                      onClick={() => handleAdminDeleteUser(user._id, user.name || user.email)}
                    >
                      Eliminar usuario
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {registeredUsers.length === 0 && (
            <p className="admin-empty">No hay usuarios registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

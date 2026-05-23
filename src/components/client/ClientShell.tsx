import type { Subscription } from "../../types";

type ClientShellProps = {
  email: string;
  name?: string;
  pathname: string;
  onNavigate?: (path: string) => void;
  onGoHome?: () => void;
  onLogout: () => void;
  portalPage: string;
  portalTitle: string;
  activeSubscriptions: Subscription[];
  downloadCoursePDF: () => void;
  openCount: number;
  progressCount: number;
  closedCount: number;
  error: string;
  notice: string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  children: React.ReactNode;
};

const clientNavItems = [
  {
    id: "clientOverview", label: "Panel cliente", path: "/portal",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  },
  {
    id: "support", label: "Soporte y tickets", path: "/portal/soporte",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  },
  {
    id: "subscriptions", label: "Suscripciones", path: "/portal/suscripciones",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  },
  {
    id: "contracts", label: "Contrataciones", path: "/portal/contrataciones",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  },
  {
    id: "payments", label: "Metodos de pago", path: "/portal/pagos",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
  },
  {
    id: "repair", label: "Reparacion a distancia", path: "/portal/reparacion",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
  },
  {
    id: "account", label: "Mi cuenta", path: "/portal/cuenta",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  },
];

export function ClientShell({
  email,
  name,
  onNavigate,
  onGoHome,
  onLogout,
  portalPage,
  portalTitle,
  activeSubscriptions,
  downloadCoursePDF,
  openCount,
  progressCount,
  closedCount,
  error,
  notice,
  sidebarOpen,
  setSidebarOpen,
  children,
}: ClientShellProps) {
  return (
    <div className="client-shell">
      <div className="client-mobile-header">
        <button
          className="client-mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="client-mobile-brand">
          <span className="logo__icon">◈</span> SMP
        </div>
        <button className="client-btn client-btn--sm" onClick={onLogout}>
          Salir
        </button>
      </div>

      {sidebarOpen && (
        <div className="client-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`client-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="client-sidebar__brand">
          <h3><span className="logo__icon">◈</span> SMP</h3>
          <p>Cliente</p>
          <span className="client-email" title={name || email}>{name || email}</span>
        </div>

        <nav className="client-nav">
          <p className="client-nav__title">Navegacion</p>
          {clientNavItems.map((item) => (
            <button
              key={item.id}
              className={portalPage === item.id ? "active" : ""}
              onClick={() => {
                onNavigate?.(item.path);
                setSidebarOpen(false);
              }}
              type="button"
            >
              <span className="client-nav__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {activeSubscriptions.length > 0 && (
          <div className="client-sidebar__plan">
            <p className="client-sidebar__plan-label">Plan activo</p>
            <p className="client-sidebar__plan-name">
              {activeSubscriptions[0].planName}
            </p>
            {activeSubscriptions[0].planId === "learning" && (
              <button
                className="client-btn client-btn--sm"
                onClick={downloadCoursePDF}
                style={{ marginTop: "0.5rem", width: "100%", borderColor: "#f59e0b", color: "#f59e0b" }}
              >
                Curso
              </button>
            )}
          </div>
        )}

        <div className="client-sidebar__meta">
          <p>
            Rol: <strong>Cliente</strong>
          </p>
          <p>
            Estado: <span className="status-dot" /> Conectado
          </p>
        </div>

        <div className="client-sidebar__footer">
          <button className="client-btn" onClick={onGoHome} type="button">
            Pagina principal
          </button>
          <button className="client-btn" onClick={onLogout} type="button" style={{ color: "#ff6b6b" }}>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="client-main">
        <header className="client-header">
          <h2>{portalTitle}</h2>
          <div className="client-header__actions">
            {portalPage === "support" && (
              <div className="client-kpi-badges">
                <span className="client-kpi-badge client-kpi-badge--blue">Abiertos: {openCount}</span>
                <span className="client-kpi-badge client-kpi-badge--amber">Progreso: {progressCount}</span>
                <span className="client-kpi-badge client-kpi-badge--green">Cerrados: {closedCount}</span>
              </div>
            )}
          </div>
        </header>

        <div className="client-content">
          {(error || notice) && (
            <div className="client-feedback">
              {error && <p className="modal-error">{error}</p>}
              {notice && <p className="modal-success">{notice}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

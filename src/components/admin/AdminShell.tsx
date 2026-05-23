import { useState } from "react";

type AdminShellProps = {
  email: string;
  name?: string;
  pathname: string;
  onNavigate?: (path: string) => void;
  onGoHome?: () => void;
  onLogout: () => void;
  portalPage: string;
  portalTitle: string;
  openCount: number;
  progressCount: number;
  error: string;
  notice: string;
  children: React.ReactNode;
};

const adminNavItems = [
  {
    id: "adminOverview", label: "Panel admin", path: "/portal/admin",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  },
  {
    id: "adminPanel", label: "Panel", path: "/portal/admin/panel",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
  },
  {
    id: "adminUsers", label: "Usuarios", path: "/portal/admin/usuarios",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  },
  {
    id: "support", label: "Chats y tickets", path: "/portal/admin/chats",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  },
  {
    id: "adminContracts", label: "Contrataciones", path: "/portal/admin/contrataciones",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
  },
  {
    id: "doubtChats", label: "Consultas", path: "/portal/admin/consultas",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
  },
];

export function AdminShell({
  email,
  name,
  onNavigate,
  onGoHome,
  onLogout,
  portalPage,
  portalTitle,
  openCount,
  progressCount,
  error,
  notice,
  children,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <div className="admin-mobile-header">
        <button
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="admin-mobile-brand">
          <span className="logo__icon">◈</span> SMP
        </div>
        <button className="admin-btn admin-btn--sm" onClick={onLogout}>
          Salir
        </button>
      </div>

      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar__brand">
          <h3><span className="logo__icon">◈</span> SMP</h3>
          <p>Administrador</p>
          <span className="admin-email" title={name || email}>{name || email}</span>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav__title">Navegacion</p>
          {adminNavItems.map((item) => (
            <button
              key={item.id}
              className={portalPage === item.id ? "active" : ""}
              onClick={() => {
                onNavigate?.(item.path);
                setSidebarOpen(false);
              }}
              type="button"
            >
              <span className="admin-nav__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__status">
            <span className="status-dot" /> Conectado
          </div>
          <button className="admin-btn" onClick={onGoHome} type="button">
            Pagina principal
          </button>
          <button className="admin-btn" onClick={onLogout} type="button" style={{ color: "#ff6b6b" }}>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h2>{portalTitle}</h2>
          <div className="admin-header__actions">
            {portalPage === "support" && (
              <span style={{ fontSize: "0.75rem", color: "var(--admin-t2)" }}>
                {openCount + progressCount} pendientes
              </span>
            )}
            <button className="admin-btn admin-btn--sm" onClick={onLogout} type="button" style={{ color: "#ff6b6b" }}>
              Salir
            </button>
          </div>
        </header>

        <div className="admin-content">
          {(error || notice) && (
            <div style={{ marginBottom: "1rem" }}>
              {error && <p style={{ fontSize: "0.82rem", color: "#ff6b6b", background: "rgba(255, 107, 107, 0.08)", border: "1px solid rgba(255, 107, 107, 0.2)", padding: "0.6rem 0.9rem", borderRadius: "8px" }}>{error}</p>}
              {notice && <p style={{ fontSize: "0.82rem", color: "#4ade80", background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.2)", padding: "0.6rem 0.9rem", borderRadius: "8px" }}>{notice}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

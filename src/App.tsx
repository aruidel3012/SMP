import { useEffect, useState } from "react";
import { NAV_LINKS } from "./data/plans";
import { ParticleCanvas } from "./components/shared/ParticleCanvas";
import { AuthModal } from "./components/shared/AuthModal";
import { Services } from "./components/services";
import { Pricing } from "./components/pricing";
import { Stats } from "./components/stats";
import { About } from "./components/about";
import { Contact } from "./components/contact";
import { Footer } from "./components/footer";
import { ClientArea } from "./components/clientArea";
import { DoubtChat } from "./components/DoubtChat";
import "./styles/landing.css";
import "./styles/pricing.css";
import "./styles/modal.css";
import "./styles/doubt-chat.css";
import "./styles/portal.css";

type SessionUser = {
  email: string;
  name?: string;
  accountType?: "empresa" | "particular";
  createdAt?: string;
  role?: "client" | "admin";
};

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || "",
  );
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as SessionUser;
    } catch {
      localStorage.removeItem("auth_user");
      return null;
    }
  });

  const isLoggedIn = Boolean(token && sessionUser);
  const isPortalRoute = pathname.startsWith("/portal");
  const portalPath = sessionUser?.role === "admin" ? "/portal/admin" : "/portal";

  const navigateTo = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
      setPathname(nextPath);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const revealVisible = () => {
      document.querySelectorAll(".reveal:not(.revealed)").forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
          element.classList.add("revealed");
        }
      });
    };

    revealVisible();
    window.addEventListener("scroll", revealVisible, { passive: true });
    return () => window.removeEventListener("scroll", revealVisible);
  }, []);

  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
  }, [authOpen]);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleAuthSuccess = (payload: { token: string; user: SessionUser }) => {
    setToken(payload.token);
    setSessionUser(payload.user);
    localStorage.setItem("auth_token", payload.token);
    localStorage.setItem("auth_user", JSON.stringify(payload.user));
    navigateTo(payload.user.role === "admin" ? "/portal/admin" : "/portal");
  };

  const handleLogout = () => {
    setToken("");
    setSessionUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigateTo("/");
  };

  if (isLoggedIn && sessionUser && isPortalRoute) {
    return (
      <div className="app app--portal">
        <main className="portal-shell">
          <ClientArea
            email={sessionUser.email}
            name={sessionUser.name}
            role={sessionUser.role || "client"}
            pathname={pathname}
            onNavigate={navigateTo}
            onGoHome={() => navigateTo("/")}
            onLogout={handleLogout}
          />
        </main>
      </div>
    );
  }

  if (isPortalRoute && !isLoggedIn) {
    return (
      <div className="app app--portal">
        <main className="portal-shell portal-shell--locked">
          <section className="portal-gate">
            <p className="tag">Acceso restringido</p>
            <h1 className="section-title">Portal de clientes SMP</h1>
            <p className="section-sub">
              Esta área está separada del sitio principal. Inicia sesión para
              entrar al panel de cliente o administrador.
            </p>
            <div className="hero__actions">
              <button className="btn btn-primary" onClick={() => setAuthOpen(true)}>
                Iniciar sesión
              </button>
              <button className="btn btn-outline" onClick={() => navigateTo("/")}>
                Volver al sitio principal
              </button>
            </div>
          </section>
          {authOpen && (
            <AuthModal
              onClose={() => setAuthOpen(false)}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <ParticleCanvas />

      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav__inner">
          <a href="#" className="logo">
            <span className="logo__icon"></span>SMP
          </a>

          {menuOpen && (
            <div className="nav__overlay" onClick={() => setMenuOpen(false)} />
          )}

          <ul className={`nav__links ${menuOpen ? "open" : ""}`}>
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link}
                </a>
              </li>
            ))}
            <li>
              {isLoggedIn ? (
                <button
                  className="nav__pill"
                  onClick={() => {
                    navigateTo(portalPath);
                    setMenuOpen(false);
                  }}
                >
                  Mi panel
                </button>
              ) : (
                <button
                  className="nav__pill"
                  onClick={() => {
                    setAuthOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Acceder
                </button>
              )}
            </li>
          </ul>

          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__glow hero__glow--2" />
        <div className="container hero__inner">
          <div className="hero__badge reveal">
            <span className="badge-pulse" />
            Soporte activo · España
          </div>

          <h1 className="hero__title reveal">
            Expertos en que
            <br />
            <span className="text-blue">TODO funcione</span>
          </h1>

          <p className="hero__sub reveal">
            Infraestructura, seguridad y soporte IT para empresas que no pueden
            permitirse tiempos de inactividad.
          </p>

          <div className="hero__actions reveal">
            <a href="#contacto" className="btn btn-primary">
              Empezar ahora
            </a>
            <button
              className="btn btn-outline"
              onClick={() => {
                if (isLoggedIn) navigateTo(portalPath);
                else setAuthOpen(true);
              }}
            >
              {isLoggedIn ? "Ir a mi panel" : "Acceder / Registrarse"}
            </button>
          </div>
        </div>

        <div className="hero__scroll">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      <Stats />
      <Services />
      <Pricing
        onOpenAuth={() => {
          if (isLoggedIn) navigateTo(portalPath);
          else setAuthOpen(true);
        }}
      />
      <About />
      <Contact />
      <Footer />

      <DoubtChat />

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

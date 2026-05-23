import { useState, useRef } from "react";

type AuthMode = "login" | "register";
type AuthStep = "form" | "verify" | "forgotRequest" | "forgotVerify";
type AuthUser = {
  email: string;
  name?: string;
  accountType?: "empresa" | "particular";
  createdAt?: string;
  role?: "client" | "admin";
};
type AuthPayload = { token: string; user: AuthUser };

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    if (/Failed to fetch/i.test(error.message)) {
      return "No se pudo conectar con el servidor. Puede que esté arrancando, inténtalo de nuevo en unos segundos.";
    }
    return error.message;
  }
  return fallback;
}

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (payload: AuthPayload) => void;
}

export function AuthModal({ onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<AuthStep>("form");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"empresa" | "particular">(
    "particular",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const API = import.meta.env.VITE_API_URL || "https://smp-76gz.onrender.com/api/auth";

  const reset = () => {
    setEmail("");
    setName("");
    setAccountType("particular");
    setPassword("");
    setConfirm("");
    setNewPassword("");
    setCode(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
    setStep("form");
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    reset();
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError("Email y contraseña son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        if (name.trim().length < 2) {
          setError("El nombre debe tener al menos 2 caracteres.");
          setLoading(false);
          return;
        }
        if (password !== confirm) {
          setError("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            name: name.trim(),
            accountType,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al registrarse");
        if (data.requiresVerification) {
          setStep("verify");
          setLoading(false);
          return;
        }
        if (data?.token && data?.user?.email)
          onAuthSuccess({ token: data.token, user: data.user });
        setSuccess("Cuenta creada. Iniciando sesión...");
        setTimeout(onClose, 1200);
      } else {
        const res = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Credenciales incorrectas");
        if (data?.token && data?.user?.email)
          onAuthSuccess({ token: data.token, user: data.user });
        setSuccess("¡Sesión iniciada correctamente!");
        setTimeout(onClose, 1200);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Ocurrió un error inesperado."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    const fullCode = code.join("");
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Código incorrecto");
      if (data?.token && data?.user?.email) {
        onAuthSuccess({ token: data.token, user: data.user });
        setSuccess("¡Cuenta verificada! Redirigiendo...");
        setTimeout(onClose, 1500);
      } else {
        setSuccess("¡Cuenta verificada! Ya puedes iniciar sesión.");
        setTimeout(() => switchMode("login"), 2000);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Ocurrió un error inesperado."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${API}/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "No se pudo reenviar el código.");
      setCode(["", "", "", "", "", ""]);
      setSuccess("Código reenviado. Revisa tu correo.");
      codeRefs.current[0]?.focus();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "No se pudo reenviar el código."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Introduce tu email para recuperar la contraseña.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "No se pudo enviar el código.");
      setStep("forgotVerify");
      setSuccess("Código enviado. Revisa tu correo.");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "No se pudo enviar el código."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const fullCode = code.join("");
    if (!normalizedEmail || !fullCode || !newPassword.trim()) {
      setError("Completa email, código y nueva contraseña.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          code: fullCode,
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo restablecer.");
      setSuccess("Contraseña actualizada. Ya puedes iniciar sesión.");
      setTimeout(() => {
        setStep("form");
        setMode("login");
        setCode(["", "", "", "", "", ""]);
        setNewPassword("");
      }, 1600);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "No se pudo restablecer."));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handleCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0)
      codeRefs.current[i - 1]?.focus();
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("modal-backdrop"))
      onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-logo">
          <span className="logo__icon">◈</span> SMP
        </div>

        {step === "form" && (
          <div className="modal-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="modal-body">
            <div className="fgroup">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode === "register" && (
              <>
                <div className="fgroup">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre o empresa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="fgroup">
                  <label>Tipo de cuenta</label>
                  <select
                    value={accountType}
                    onChange={(e) =>
                      setAccountType(e.target.value as "empresa" | "particular")
                    }
                  >
                    <option value="particular">Particular</option>
                    <option value="empresa">Empresa</option>
                  </select>
                </div>
              </>
            )}

            <div className="fgroup">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode === "register" && (
              <div className="fgroup">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            )}

            {mode === "login" && (
              <button
                className="modal-back"
                onClick={() => {
                  setStep("forgotRequest");
                  setError("");
                  setSuccess("");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            {error && <p className="modal-error">{error}</p>}
            {success && <p className="modal-success">{success}</p>}

            <button
              className="btn btn-primary btn-full modal-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Crear cuenta"
              )}
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="modal-body">
            <div className="verify-icon">✉️</div>
            <p className="verify-text">
              Hemos enviado un código de 6 dígitos a<br />
              <strong>{email}</strong>
            </p>
            <div className="code-inputs">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className="code-box"
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKey(i, e)}
                />
              ))}
            </div>
            {error && <p className="modal-error">{error}</p>}
            {success && <p className="modal-success">{success}</p>}
            <button
              className="btn btn-primary btn-full"
              onClick={handleVerify}
              disabled={loading || code.join("").length < 6}
            >
              {loading ? <span className="spinner" /> : "Verificar cuenta"}
            </button>
            <button
              className="modal-back"
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? "Reenviando..." : "Reenviar código"}
            </button>
            <button
              className="modal-back"
              onClick={() => {
                setStep("form");
                setError("");
              }}
            >
              ← Volver
            </button>
          </div>
        )}

        {step === "forgotRequest" && (
          <div className="modal-body">
            <p className="verify-text">
              Escribe tu correo y te enviaremos un código para recuperar tu
              contraseña.
            </p>
            <div className="fgroup">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleForgotPasswordRequest()
                }
              />
            </div>
            {error && <p className="modal-error">{error}</p>}
            {success && <p className="modal-success">{success}</p>}
            <button
              className="btn btn-primary btn-full"
              onClick={handleForgotPasswordRequest}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Enviar código"}
            </button>
            <button
              className="modal-back"
              onClick={() => {
                setStep("form");
                setError("");
                setSuccess("");
              }}
            >
              ← Volver al login
            </button>
          </div>
        )}

        {step === "forgotVerify" && (
          <div className="modal-body">
            <div className="verify-icon">🔐</div>
            <p className="verify-text">
              Introduce el código y tu nueva contraseña.
            </p>
            <div className="code-inputs">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className="code-box"
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKey(i, e)}
                />
              ))}
            </div>
            <div className="fgroup">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {error && <p className="modal-error">{error}</p>}
            {success && <p className="modal-success">{success}</p>}
            <button
              className="btn btn-primary btn-full"
              onClick={handleResetPassword}
              disabled={
                loading ||
                code.join("").length < 6 ||
                newPassword.trim().length < 8
              }
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                "Restablecer contraseña"
              )}
            </button>
            <button
              className="modal-back"
              onClick={handleForgotPasswordRequest}
              disabled={loading}
            >
              Reenviar código
            </button>
            <button
              className="modal-back"
              onClick={() => {
                setStep("form");
                setMode("login");
                setError("");
                setSuccess("");
              }}
            >
              ← Volver al login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";

interface ClientAreaProps {
  email: string;
  onLogout: () => void;
}

export const Client = ({ email, onLogout }: ClientAreaProps) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const initials = email?.[0]?.toUpperCase() ?? "U";

  return (
    <div style={{ background: "#000", color: "#1e78ff", padding: 30 }}>
      <h2>Área de Cliente</h2>

      <p>{email}</p>

      <p>{now.toLocaleTimeString("es-ES")}</p>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #1e78ff",
          borderRadius: 10,
        }}
      >
        <p>Inicial: {initials}</p>

        <button
          onClick={onLogout}
          style={{
            marginTop: 10,
            background: "#1e78ff",
            color: "#000",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

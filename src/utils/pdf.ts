import { getAuthToken } from "./api.ts";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/auth", "") ||
  "https://smp-76gz.onrender.com/api";

export async function downloadCoursePDF() {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/course/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Error al descargar el curso." }));
    alert(err.message);
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Manual_Soporte_Informatico_SMP.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

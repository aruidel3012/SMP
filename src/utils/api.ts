const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/auth", "") ||
  "https://smp-76gz.onrender.com/api";

export function getAuthToken() {
  return localStorage.getItem("auth_token") || "";
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error de servidor.");
  return data;
}

export { API_BASE };

export function getInitials(value: string) {
  const clean = value.trim();
  if (!clean) return "US";
  const parts = clean.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const atIndex = clean.indexOf("@");
  return atIndex > 1
    ? (clean[0] + clean[1]).toUpperCase()
    : clean.slice(0, 2).toUpperCase();
}

export function statusLabel(status: string) {
  if (status === "in_progress") return "En progreso";
  if (status === "closed") return "Cerrado";
  return "Abierto";
}

export function statusDotClass(status: string) {
  if (status === "in_progress") return "amber";
  if (status === "closed") return "green";
  return "blue";
}

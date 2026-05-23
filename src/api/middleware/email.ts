import dns from "dns/promises";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwam.com",
  "sharklasers.com",
  "spam4.me",
  "trashmail.com",
  "trashmail.me",
  "yopmail.com",
  "10minutemail.com",
  "dispostable.com",
  "mailnull.com",
  "fakeinbox.com",
  "maildrop.cc",
  "discard.email",
  "getnada.com",
  "nada.email",
  "tmpmail.net",
]);

export async function validateEmail(email: string): Promise<{valid: boolean; reason?: string}> {
  if (!EMAIL_REGEX.test(email))
    return {
      valid: false,
      reason: "El formato del correo electrónico no es válido.",
    };
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain))
    return {
      valid: false,
      reason: "No se permiten correos temporales o desechables.",
    };
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0)
      return {
        valid: false,
        reason:
          "El dominio del correo no tiene servidores de correo configurados.",
      };
  } catch {
    return {
      valid: false,
      reason: "El dominio del correo no existe o no acepta emails.",
    };
  }
  return { valid: true };
}

import { Resend } from "resend";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { CODE_TTL_MS } from "../config.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export function hasEmailConfig(): boolean {
  const key = process.env.RESEND_API_KEY || "";
  return !!(key && key.startsWith("re_") && key.length > 10);
}

export function getPublicErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Error interno del servidor.";
  if ((err as Record<string, unknown>)?.name === "ValidationError") return "Error de validación en el email.";
  if ((err as Record<string, unknown>)?.statusCode === 401) return "Error de email: API key inválida.";
  if ((err as Record<string, unknown>)?.statusCode === 429) return "Error de email: Límite de envío excedido.";
  return "Error interno del servidor.";
}

export function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function buildCodeData(): { code: string; expiry: Date } {
  return { code: generateCode(), expiry: new Date(Date.now() + CODE_TTL_MS) };
}

export function signSessionToken(payload: Record<string, unknown>): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Falta JWT_SECRET");
  return jwt.sign(payload, s, { expiresIn: "7d" });
}

export async function sendVerificationEmail(email: string, code: string, expiryDate: Date): Promise<void> {
  if (!hasEmailConfig()) throw new Error("EMAIL_MISSING_CONFIG");
  const expiryTime = expiryDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "SMP <onboarding@resend.dev>",
    to: email,
    subject: "Tu código de verificación SMP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080d14;color:#eef3ff;padding:40px;border-radius:16px;border:1px solid rgba(30,120,255,0.2);">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:2rem;color:#1e78ff;">&#9674;</span>
          <span style="font-size:1.4rem;font-weight:700;letter-spacing:.06em;margin-left:8px;">SMP</span>
        </div>
        <h2 style="text-align:center;margin-bottom:8px;">Verifica tu cuenta</h2>
        <p style="text-align:center;color:#8ba4cc;margin-bottom:28px;">Introduce este código en la aplicación para activar tu cuenta.</p>
        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:28px;">
          ${code
            .split("")
            .map(
              (d: string) =>
                `<span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:56px;background:#0c1422;border:2px solid rgba(30,120,255,0.4);border-radius:10px;font-size:1.6rem;font-weight:700;color:#4da3ff;">${d}</span>`,
            )
            .join("")}
        </div>
        <p style="text-align:center;color:#3e5578;font-size:.85rem;">Válido hasta las <strong style="color:#8ba4cc;">${expiryTime}</strong>.</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(email: string, code: string, expiryDate: Date): Promise<void> {
  if (!hasEmailConfig()) throw new Error("EMAIL_MISSING_CONFIG");
  const expiryTime = expiryDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "SMP <onboarding@resend.dev>",
    to: email,
    subject: "Código para restablecer contraseña - SMP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080d14;color:#eef3ff;padding:40px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;"><span style="font-size:2rem;color:#1e78ff;">&#9674;</span><span style="font-size:1.4rem;font-weight:700;margin-left:8px;">SMP</span></div>
        <h2 style="text-align:center;margin-bottom:10px;">Restablecer contraseña</h2>
        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;">
          ${code
            .split("")
            .map(
              (d: string) =>
                `<span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:56px;background:#0c1422;border:2px solid rgba(30,120,255,0.4);border-radius:10px;font-size:1.6rem;font-weight:700;color:#4da3ff;">${d}</span>`,
            )
            .join("")}
        </div>
        <p style="text-align:center;color:#3e5578;font-size:.85rem;">Código válido hasta las <strong style="color:#8ba4cc;">${expiryTime}</strong>.</p>
      </div>`,
  });
}

export async function sendSubscriptionEmail(email: string, planName: string, planType: string): Promise<void> {
  if (!hasEmailConfig()) return;
  const typeLabel =
    planType === "one_time" ? "Pago único" : "Suscripción mensual";
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "SMP <onboarding@resend.dev>",
    to: email,
    subject: `Confirmación de ${typeLabel === "Pago único" ? "pago" : "suscripción"}: ${planName} - SMP`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080d14;color:#eef3ff;padding:40px;border-radius:16px;border:1px solid rgba(30,120,255,0.2);">
        <div style="text-align:center;margin-bottom:24px;"><span style="font-size:2rem;color:#1e78ff;">&#9674;</span><span style="font-size:1.4rem;font-weight:700;margin-left:8px;">SMP</span></div>
        <h2 style="text-align:center;color:#4ade80;margin-bottom:16px;">&#10003; ${typeLabel === "Pago único" ? "Pago confirmado" : "Suscripción activada"}</h2>
        <p style="text-align:center;color:#8ba4cc;">Has ${typeLabel === "Pago único" ? "adquirido" : "activado"} el plan <strong style="color:#4da3ff;">${planName}</strong>.</p>
        <p style="text-align:center;color:#3e5578;font-size:.85rem;margin-top:16px;">Ya puedes acceder a todos los beneficios desde tu panel de cliente.</p>
      </div>`,
  });
}

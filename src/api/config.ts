import dotenv from "dotenv";
dotenv.config();

export const PORT: string | number = process.env.PORT || 4000;
export const CODE_TTL_MS: number = 15 * 60 * 1000;
export const EMAIL_VERIFICATION_REQUIRED: boolean = process.env.EMAIL_VERIFICATION_REQUIRED !== "false";
export const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL || "admin@smp.es";
export const ADMIN_LOGIN_EMAIL: string = process.env.ADMIN_LOGIN_EMAIL || "admin@smp.es";
export const ADMIN_LOGIN_EMAIL_ALT: string = process.env.ADMIN_LOGIN_EMAIL_ALT || "admin2@smp.es";
export const ADMIN_LOGIN_PASSWORD: string = process.env.ADMIN_LOGIN_PASSWORD || "";
export const ACCOUNT_TYPES: string[] = ["empresa", "particular"];
export const PRIMARY_ADMIN_EMAIL: string = process.env.PRIMARY_ADMIN_EMAIL || "aruidel3012@g.educaand.es";

interface SubscriptionPlan {
  id: string;
  name: string;
  type: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  color: string;
}

interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
}

export function isAdminEmail(email: string): boolean {
  const normalized = (email || "").trim().toLowerCase();
  return [PRIMARY_ADMIN_EMAIL, ADMIN_EMAIL, ADMIN_LOGIN_EMAIL, ADMIN_LOGIN_EMAIL_ALT]
    .map((v) => v.toLowerCase())
    .includes(normalized);
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "basic", name: "Básico", type: "subscription", price: 59, period: "mes", description: "Mantenimiento y reparación", features: ["Soporte técnico", "Reparaciones (mano de obra incluida) sin costes de desplazamiento en distancia menor a 90km", "NO incluye componentes nuevos (se cargará el precio si nosotros compramos el componente)", "1h de intervención mensual incluida"], highlighted: false, color: "#4da3ff" },
  { id: "por", name: "Pro", type: "subscription", price: 99.99, period: "mes", description: "Todo + monitoreo remoto + prioridad", features: ["Todo lo del plan básico", "Monitorización remota", "Soporte prioritario (respuesta en menos de 24h)", "2h mensuales de intervención incluidas"], highlighted: true, color: "#1e78ff" },
  { id: "learning", name: "Learning", type: "one_time", price: 60, period: "único", description: "Solo curso", features: ["Curso formativo completo"], highlighted: false, color: "#f59e0b" },
  { id: "completo", name: "Completo", type: "subscription", price: 139, period: "mes", description: "Todas las características de otros planes con un descuento", features: ["Todas las características de otros planes", "3 horas mensuales de reparación incluidas"], highlighted: false, color: "#13b981" },
];

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { id: "srv-1", name: "Mantenimiento de equipos", description: "Mantenimiento preventivo y correctivo de PCs y servidores.", price: "Desde 49€/mes" },
  { id: "srv-2", name: "Monitorización 24/7", description: "Alertas en tiempo real y supervisión continua de infraestructura.", price: "Desde 99€/mes" },
  { id: "srv-3", name: "Seguridad endpoint", description: "Protección avanzada, hardening y respuesta ante incidentes.", price: "Desde 79€/mes" },
];

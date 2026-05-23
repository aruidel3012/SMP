export const NAV_LINKS = ["Servicios", "Precios", "Nosotros", "Contacto"];

export const SERVICES = [
  { icon: "🛡️", title: "Soporte Técnico 24/7", desc: "Resolución de incidencias con tiempos de respuesta garantizados y equipo especializado siempre disponible." },
  { icon: "⚡", title: "Desarrollo de Software", desc: "Aplicaciones a medida, APIs e integraciones. Código limpio, escalable y entrega continua." },
  { icon: "🔒", title: "Seguridad IT", desc: "Auditorías, hardening, protección endpoint y respuesta ante incidentes de seguridad." },
  { icon: "☁️", title: "Cloud e Infraestructura", desc: "Migración, gestión y optimización de entornos cloud. AWS, Azure y soluciones híbridas." },
  { icon: "📊", title: "Monitorización Proactiva", desc: "Supervisión continua de sistemas con alertas en tiempo real y mantenimiento preventivo." },
  { icon: "💡", title: "Consultoría IT", desc: "Estrategia tecnológica alineada con tu negocio. Decisiones basadas en datos, no suposiciones." },
];

export const STATS = [
  { value: "<2h", label: "Tiempo de respuesta" },
  { value: "500+", label: "Clientes atendidos" },
  { value: "12+", label: "Años de experiencia" },
  { value: "99.9%", label: "Uptime garantizado" },
];

export const SUBSCRIPTION_PLANS = [
  { id: "basic", name: "Básico", type: "subscription" as const, price: 59, period: "mes", description: "Mantenimiento y reparación", features: ["Soporte técnico", "Reparaciones (mano de obra incluida) sin costes de desplazamiento en distancia menor a 90km", "NO incluye componentes nuevos (se cargará el precio si nosotros compramos el componente)", "1h de intervención mensual incluida"], highlighted: false, color: "#4da3ff", badge: null },
  { id: "por", name: "Pro", type: "subscription" as const, price: 99.99, period: "mes", description: "Todo + monitoreo remoto + prioridad", features: ["Todo lo del plan básico", "Monitorización remota", "Soporte prioritario (respuesta en menos de 24h)", "2h mensuales de intervención incluidas"], highlighted: true, color: "#1e78ff", badge: "Más popular" },
  { id: "learning", name: "Learning", type: "one_time" as const, price: 60, period: "único", description: "Solo curso", features: ["Curso formativo completo"], highlighted: false, color: "#f59e0b", badge: "Pago único" },
  { id: "completo", name: "Completo", type: "subscription" as const, price: 139, period: "mes", description: "Todas las características de otros planes con un descuento", features: ["Todas las características de otros planes", "3 horas mensuales de reparación incluidas"], highlighted: false, color: "#13b981", badge: "Todo incluido" },
] as const;

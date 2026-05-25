import { useCallback, useEffect, useState, useRef } from "react";
import { SUBSCRIPTION_PLANS } from "../data/plans";
import { authFetch } from "../utils/api";
import { statusLabel, statusDotClass } from "../utils/helpers";
import { downloadCoursePDF } from "../utils/pdf";
import "../styles/admin.css";
import "../styles/client.css";
import type { Service, Ticket, Message, Contract, Profile, Subscription, PaymentMethod, RemoteRepair, DoubtMessage, RegisteredUser, SubscriptionPlan, ClientAreaProps } from "../types";
import { AdminShell } from "./admin/AdminShell";
import { AdminOverview } from "./admin/AdminOverview";
import { AdminPanel } from "./admin/AdminPanel";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminContracts } from "./admin/AdminContracts";
import { AdminSupport } from "./admin/AdminSupport";
import { AdminDoubtChats } from "./admin/AdminDoubtChats";
import { AdminRepairs } from "./admin/AdminRepairs";
import { ClientShell } from "./client/ClientShell";
import { ClientOverview } from "./client/ClientOverview";
import { ClientSubscriptions } from "./client/ClientSubscriptions";
import { ClientContracts } from "./client/ClientContracts";
import { ClientSupport } from "./client/ClientSupport";
import { ClientAccount } from "./client/ClientAccount";
import { ClientPayments } from "./client/ClientPayments";
import { ClientRepair } from "./client/ClientRepair";
import { ConfirmHireModal } from "./shared/ConfirmHireModal";

export function ClientArea({
  email,
  name,
  role = "client",
  pathname = "/portal",
  onNavigate,
  onGoHome,
  onLogout,
}: ClientAreaProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [repairs, setRepairs] = useState<RemoteRepair[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [adminSelectedEmail, setAdminSelectedEmail] = useState("");
  const [adminSelectedPlanId, setAdminSelectedPlanId] = useState<string>(
    SUBSCRIPTION_PLANS[0]?.id || "",
  );
  const [adminSelectedServiceId, setAdminSelectedServiceId] = useState("");
  const [adminEquipmentCount, setAdminEquipmentCount] = useState(1);
  const [adminAssignLoading, setAdminAssignLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [accountName, setAccountName] = useState(name || "");
  const [accountType, setAccountType] = useState<"empresa" | "particular">("particular");
  const [equipmentByService, setEquipmentByService] = useState<Record<string, number>>({});
  const [payType, setPayType] = useState<"card" | "transfer" | "bizum">("card");
  const [payAlias, setPayAlias] = useState("");
  const [payLast4, setPayLast4] = useState("");
  const [payHolder, setPayHolder] = useState("");
  const [payExpiry, setPayExpiry] = useState("");
  const [payCVV, setPayCVV] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [payIban, setPayIban] = useState("");
  const [repairDevice, setRepairDevice] = useState("pc");
  const [repairIssue, setRepairIssue] = useState("");
  const [repairUrgency, setRepairUrgency] = useState<"normal" | "high" | "critical">("normal");
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const doubtChatBoxRef = useRef<HTMLDivElement>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteStep, setDeleteStep] = useState<"idle" | "code-sent" | "confirming">("idle");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [doubtMessages, setDoubtMessages] = useState<DoubtMessage[]>([]);
  const [doubtSessions, setDoubtSessions] = useState<{ _id: string; senderName: string; lastMessage: string; messageCount: number; createdAt: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [doubtReplyContent, setDoubtReplyContent] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [confirmHireData, setConfirmHireData] = useState<{
    type: 'subscription' | 'service';
    id: string;
    name: string;
    price: number | string;
    period?: string;
  } | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [authTerms, setAuthTerms] = useState(false);

  const selectedTicket = tickets.find((t) => t._id === selectedTicketId) || null;
  const isAdmin = role === "admin";

  const portalPage = isAdmin
    ? pathname.startsWith("/portal/admin/usuarios")
      ? "adminUsers"
      : pathname.startsWith("/portal/admin/contrataciones")
        ? "adminContracts"
      : pathname.startsWith("/portal/admin/panel")
        ? "adminPanel"
      : pathname.startsWith("/portal/admin/reparaciones")
        ? "adminRepairs"
      : pathname.startsWith("/portal/admin/consultas")
        ? "doubtChats"
        : pathname.startsWith("/portal/admin/chats")
          ? "support"
          : "adminOverview"
    : pathname.startsWith("/portal/suscripciones")
    ? "subscriptions"
    : pathname.startsWith("/portal/contrataciones")
      ? "contracts"
      : pathname.startsWith("/portal/cuenta")
        ? "account"
        : pathname.startsWith("/portal/soporte")
          ? "support"
          : pathname.startsWith("/portal/pagos")
            ? "payments"
            : pathname.startsWith("/portal/reparacion")
              ? "repair"
              : "clientOverview";

  const openCount = tickets.filter((t) => t.status === "open").length;
  const progressCount = tickets.filter((t) => t.status === "in_progress").length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const activeContracts = contracts.filter((c) => c.status === "active");
  const adminClientCount = new Set([
    ...tickets.map((ticket) => ticket.clientEmail),
    ...subscriptions.map((sub) => sub.clientEmail),
    ...contracts.map((contract) => contract.clientEmail),
  ]).size;

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [svcData, ctrData, tktData, profData, subsData, pmData, repData, usersData] = await Promise.all([
        authFetch("/tickets/services"),
        authFetch("/contracts"),
        authFetch("/tickets"),
        authFetch("/account/profile"),
        authFetch("/subscriptions"),
        isAdmin ? Promise.resolve({ methods: [] }) : authFetch("/payments"),
        authFetch("/repairs"),
        isAdmin ? authFetch("/client-management/users") : Promise.resolve({ users: [] }),
      ]);
      setServices(svcData.services || []);
      setContracts(ctrData.contracts || []);
      const nextTickets: Ticket[] = tktData.tickets || [];
      setTickets(nextTickets);
      setSelectedTicketId((current) => current || nextTickets[0]?._id || "");
      if (profData.profile) {
        setProfile(profData.profile);
        setAccountName(profData.profile.name || "");
        setAccountType(profData.profile.accountType || "particular");
      }
      setSubscriptions(subsData.subscriptions || []);
      setPaymentMethods(pmData.methods || []);
      setRepairs(repData.repairs || []);
      const nextUsers: RegisteredUser[] = usersData.users || [];
      setRegisteredUsers(nextUsers);
      setAdminSelectedEmail((current) => current || nextUsers[0]?.email || "");
      setAdminSelectedServiceId((current) => current || (svcData.services || [])[0]?.id || "");
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  }, [showError, isAdmin]);

  const loadMessages = useCallback(async (ticketId: string, isSilent = false) => {
    if (!ticketId) return;
    try {
      const data = await authFetch(`/tickets/${ticketId}/messages`);
      const newMsgs = data.messages || [];
      setMessages((current) => {
        if (current.length === newMsgs.length && JSON.stringify(current) === JSON.stringify(newMsgs)) {
          return current;
        }
        return newMsgs;
      });
    } catch (e) {
      if (!isSilent && e instanceof Error) showError(e.message);
    }
  }, [showError]);

  const loadTickets = useCallback(async () => {
    try {
      const data = await authFetch("/tickets");
      const nextTickets: Ticket[] = data.tickets || [];
      setTickets(nextTickets);
      setSelectedTicketId((current) => current || nextTickets[0]?._id || "");
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!selectedTicketId) { setMessages([]); return; }
    loadMessages(selectedTicketId);
  }, [loadMessages, selectedTicketId]);

  const prevMsgCountRef = useRef(0);
  const prevTicketIdRef = useRef("");

  useEffect(() => {
    if (chatBoxRef.current) {
      const ticketChanged = selectedTicketId !== prevTicketIdRef.current;
      const messageAdded = messages.length > prevMsgCountRef.current;
      if (ticketChanged || messageAdded) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }
    prevMsgCountRef.current = messages.length;
    prevTicketIdRef.current = selectedTicketId;
  }, [messages, selectedTicketId]);

  useEffect(() => {
    if (doubtChatBoxRef.current) {
      doubtChatBoxRef.current.scrollTop = doubtChatBoxRef.current.scrollHeight;
    }
  }, [doubtMessages]);

  useEffect(() => {
    const poll = setInterval(() => {
      if (document.hidden) return;
      loadTickets();
      if (selectedTicketId && (portalPage === "support" || isAdmin)) loadMessages(selectedTicketId, true);
    }, 15000);
    return () => clearInterval(poll);
  }, [loadMessages, loadTickets, selectedTicketId, portalPage, isAdmin]);

  const handleCreateTicket = async () => {
    if (isAdmin) return;
    if (title.trim().length < 5 || description.trim().length < 10) {
      showError("Asunto mínimo 5 caracteres y descripción mínima 10.");
      return;
    }
    setLoading(true);
    try {
      await authFetch("/tickets", { method: "POST", body: JSON.stringify({ title, description }) });
      setTitle("");
      setDescription("");
      showNotice("Ticket creado correctamente.");
      await loadTickets();
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!selectedTicketId || !chatInput.trim()) return;
    try {
      await authFetch(`/tickets/${selectedTicketId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: chatInput.trim(), replyToMessageId: replyTo?._id }),
      });
      setChatInput("");
      setReplyTo(null);
      await loadMessages(selectedTicketId);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubLoading(planId);
    try {
      await authFetch("/subscriptions", { method: "POST", body: JSON.stringify({ planId }) });
      showNotice("Plan activado correctamente. ¡Bienvenido!");
      const subsData = await authFetch("/subscriptions");
      setSubscriptions(subsData.subscriptions || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setSubLoading(null); }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await authFetch(`/subscriptions/${subscriptionId}/cancel`, { method: "PATCH" });
      showNotice("Suscripción cancelada.");
      const subsData = await authFetch("/subscriptions");
      setSubscriptions(subsData.subscriptions || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleContract = async (service: Service) => {
    const equipmentCount = equipmentByService[service.id] || 1;
    try {
      await authFetch("/contracts", { method: "POST", body: JSON.stringify({ serviceId: service.id, equipmentCount }) });
      showNotice("Contratación guardada correctamente.");
      const ctrData = await authFetch("/contracts");
      setContracts(ctrData.contracts || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleContractUpdate = async (contractId: string, patch: { equipmentCount?: number; status?: "active" | "paused" | "cancelled" }) => {
    try {
      await authFetch(`/contracts/${contractId}`, { method: "PATCH", body: JSON.stringify(patch) });
      showNotice("Contrato actualizado.");
      const ctrData = await authFetch("/contracts");
      setContracts(ctrData.contracts || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const refreshAdminData = async () => {
    const [subsData, ctrData, usersData] = await Promise.all([
      authFetch("/subscriptions"),
      authFetch("/contracts"),
      authFetch("/client-management/users"),
    ]);
    setSubscriptions(subsData.subscriptions || []);
    setContracts(ctrData.contracts || []);
    setRegisteredUsers(usersData.users || []);
  };

  const handleAdminAssignPlan = async () => {
    if (!adminSelectedEmail || !adminSelectedPlanId) {
      showError("Selecciona un usuario y una suscripcion.");
      return;
    }
    setAdminAssignLoading(true);
    try {
      await authFetch("/client-management/assign-plan", { method: "POST", body: JSON.stringify({ email: adminSelectedEmail, planId: adminSelectedPlanId }) });
      showNotice("Suscripcion asignada correctamente.");
      await refreshAdminData();
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setAdminAssignLoading(false); }
  };

  const handleAdminAssignService = async () => {
    if (!adminSelectedEmail || !adminSelectedServiceId) {
      showError("Selecciona un usuario y un servicio.");
      return;
    }
    setAdminAssignLoading(true);
    try {
      await authFetch("/client-management/assign-service", { method: "POST", body: JSON.stringify({ email: adminSelectedEmail, serviceId: adminSelectedServiceId, equipmentCount: adminEquipmentCount }) });
      showNotice("Servicio asignado correctamente.");
      await refreshAdminData();
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setAdminAssignLoading(false); }
  };

  const handleAdminCancelSubscription = async (subscriptionId: string) => {
    try {
      await authFetch(`/subscriptions/${subscriptionId}/cancel`, { method: "PATCH" });
      showNotice("Suscripcion cancelada.");
      const subsData = await authFetch("/subscriptions");
      setSubscriptions(subsData.subscriptions || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleAdminCancelContract = async (contractId: string) => {
    try {
      await authFetch(`/contracts/${contractId}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
      showNotice("Contrato cancelado.");
      const ctrData = await authFetch("/contracts");
      setContracts(ctrData.contracts || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleAdminDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estas seguro de eliminar permanentemente a "${userName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await authFetch(`/client-management/users/${userId}`, { method: "DELETE" });
      showNotice("Usuario eliminado permanentemente.");
      const [usersData, subsData, ctrData] = await Promise.all([
        authFetch("/client-management/users"),
        authFetch("/subscriptions"),
        authFetch("/contracts"),
      ]);
      setRegisteredUsers(usersData.users || []);
      setSubscriptions(subsData.subscriptions || []);
      setContracts(ctrData.contracts || []);
      setSelectedUserEmail("");
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleSaveAccount = async () => {
    try {
      await authFetch("/account/profile", { method: "PATCH", body: JSON.stringify({ name: accountName.trim(), accountType }) });
      showNotice("Cuenta actualizada correctamente.");
      const profData = await authFetch("/account/profile");
      if (profData.profile) setProfile(profData.profile);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleStatusChange = async (status: Ticket["status"]) => {
    if (!selectedTicketId || !isAdmin) return;
    try {
      await authFetch(`/tickets/${selectedTicketId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadTickets();
      showNotice("Estado actualizado.");
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!isAdmin) return;
    if (!confirm("¿Estas seguro de que quieres eliminar este ticket? Esta accion no se puede deshacer.")) return;
    try {
      await authFetch(`/tickets/${ticketId}`, { method: "DELETE" });
      showNotice("Ticket eliminado.");
      await loadTickets();
      if (selectedTicketId === ticketId) setSelectedTicketId("");
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const loadDoubtMessages = async (sessionId?: string) => {
    const sid = sessionId || selectedSessionId;
    if (!sid) { setDoubtMessages([]); return; }
    try {
      const data = await authFetch(`/doubt-chat?sessionId=${encodeURIComponent(sid)}`);
      setDoubtMessages(data.messages || []);
    } catch (err) { console.error(err); }
  };

  const loadDoubtSessions = useCallback(async () => {
    try {
      const data = await authFetch("/doubt-chat/sessions");
      setDoubtSessions(data.sessions || []);
    } catch (err) { console.error(err); }
  }, []);

  const handleDoubtReply = async () => {
    const content = doubtReplyContent.trim();
    if (!content || !selectedSessionId) return;
    setDoubtLoading(true);
    try {
      await authFetch(`/doubt-chat/session/${selectedSessionId}/reply`, { method: "POST", body: JSON.stringify({ content }) });
      setDoubtReplyContent("");
      showNotice("Respuesta enviada.");
      await loadDoubtMessages(selectedSessionId);
      await loadDoubtSessions();
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setDoubtLoading(false); }
  };

  const handleDeleteDoubtMessage = async (sessionId: string) => {
    if (!confirm("¿Eliminar toda esta conversacion?")) return;
    try {
      await authFetch(`/doubt-chat/session/${sessionId}`, { method: "DELETE" });
      showNotice("Conversacion eliminada.");
      if (selectedSessionId === sessionId) { setSelectedSessionId(""); setDoubtMessages([]); }
      await loadDoubtSessions();
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setDoubtReplyContent("");
    loadDoubtMessages(sessionId);
  };

  useEffect(() => {
    if (portalPage === "doubtChats") {
      loadDoubtSessions();
      setSelectedSessionId("");
      setDoubtMessages([]);
    }
  }, [loadDoubtSessions, portalPage]);

  const handleInitiateSubscribe = (plan: SubscriptionPlan) => {
    if (paymentMethods.length === 0) {
      showError("Debes registrar al menos un método de pago antes de suscribirte.");
      onNavigate?.("/portal/pagos");
      return;
    }
    setConfirmHireData({ type: 'subscription', id: plan.id, name: plan.name, price: plan.price, period: plan.period });
    setSelectedPaymentMethodId(paymentMethods[0]?._id || "");
    setAuthTerms(false);
  };

  const handleConfirmHire = async () => {
    if (!confirmHireData) return;
    if (!authTerms) { showError("Debes confirmar y autorizar el cargo para proceder."); return; }
    if (confirmHireData.type === 'subscription') {
      await handleSubscribe(confirmHireData.id);
    } else {
      const service = services.find(s => s.id === confirmHireData.id);
      if (service) await handleContract(service);
    }
    setConfirmHireData(null);
  };

  const handleSavePayment = async () => {
    if (payType === "card") {
      const cardNum = payLast4.replace(/\s/g, "");
      if (cardNum.length < 13 || cardNum.length > 19 || !/^\d+$/.test(cardNum)) {
        showError("Introduce un numero de tarjeta valido (13-19 digitos).");
        return;
      }
      let sum = 0;
      let isEven = false;
      for (let i = cardNum.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNum[i], 10);
        if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
        sum += digit;
        isEven = !isEven;
      }
      if (sum % 10 !== 0) { showError("El numero de tarjeta no es valido. Verifica los datos."); return; }
      if (!payExpiry || !/^\d{2}\/\d{2}$/.test(payExpiry)) { showError("Introduce una fecha de caducidad valida (MM/YY)."); return; }
      const [expMonth, expYear] = payExpiry.split("/").map(Number);
      if (expMonth < 1 || expMonth > 12) { showError("El mes de caducidad no es valido."); return; }
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) { showError("La tarjeta esta caducada."); return; }
      if (!payCVV || !/^\d{3,4}$/.test(payCVV)) { showError("Introduce un CVV valido (3-4 digitos)."); return; }
      if (!payHolder.trim()) { showError("El nombre del titular de la tarjeta es obligatorio."); return; }
    } else if (payType === "bizum") {
      if (!payPhone.trim() || payPhone.trim().length < 9) { showError("Debes introducir un numero de telefono de Bizum valido."); return; }
    } else if (payType === "transfer") {
      if (!payIban.trim() || payIban.trim().length < 4) { showError("Debes introducir un IBAN o numero de cuenta de transferencia valido."); return; }
    }
    setLoading(true);
    try {
      await authFetch("/payments", { method: "POST", body: JSON.stringify({ type: payType, alias: payAlias, last4: payType === "card" ? payLast4.replace(/\s/g, "").slice(-4) : payLast4, holderName: payHolder, phone: payPhone, iban: payIban, expiry: payType === "card" ? payExpiry : undefined }) });
      showNotice("Metodo de pago guardado.");
      const pmData = await authFetch("/payments");
      setPaymentMethods(pmData.methods || []);
      setPayAlias(""); setPayLast4(""); setPayHolder(""); setPayExpiry(""); setPayCVV(""); setPayPhone(""); setPayIban("");
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setLoading(false); }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await authFetch(`/payments/${id}`, { method: "DELETE" });
      showNotice("Método eliminado.");
      const pmData = await authFetch("/payments");
      setPaymentMethods(pmData.methods || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleSendRepair = async () => {
    if (repairIssue.trim().length < 10) { showError("Describe el problema con al menos 10 caracteres."); return; }
    setLoading(true);
    try {
      await authFetch("/repairs", { method: "POST", body: JSON.stringify({ deviceType: repairDevice, issue: repairIssue, urgency: repairUrgency }) });
      showNotice("Solicitud de reparación enviada. Te contactaremos pronto.");
      setRepairIssue("");
      const repData = await authFetch("/repairs");
      setRepairs(repData.repairs || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setLoading(false); }
  };

  const handleCancelRepair = async (id: string) => {
    try {
      await authFetch(`/repairs/${id}/cancel`, { method: "PATCH" });
      showNotice("Solicitud cancelada.");
      const repData = await authFetch("/repairs");
      setRepairs(repData.repairs || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleUpdateRepairStatus = async (id: string, status: RemoteRepair["status"], scheduledAt?: string, technicianNotes?: string) => {
    try {
      await authFetch(`/repairs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, scheduledAt, technicianNotes }),
      });
      showNotice("Estado de reparacion actualizado.");
      const repData = await authFetch("/repairs");
      setRepairs(repData.repairs || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleDeleteRepair = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud de reparacion permanentemente?")) return;
    try {
      await authFetch(`/repairs/${id}`, { method: "DELETE" });
      showNotice("Solicitud eliminada.");
      const repData = await authFetch("/repairs");
      setRepairs(repData.repairs || []);
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    }
  };

  const handleRequestDelete = async () => {
    if (!confirm("Esta accion eliminara permanentemente tu cuenta y todos tus datos. ¿Continuar?")) return;
    setDeleteLoading(true);
    try {
      await authFetch("/account/request-deletion", { method: "POST" });
      setDeleteStep("code-sent");
      showNotice("Codigo de verificacion enviado a tu correo.");
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setDeleteLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (deleteCode.trim().length !== 6) { showError("Introduce el codigo de 6 digitos."); return; }
    setDeleteLoading(true);
    try {
      await authFetch("/account/confirm-deletion", { method: "POST", body: JSON.stringify({ code: deleteCode.trim() }) });
      showNotice("Cuenta eliminada permanentemente.");
      localStorage.removeItem("auth_token");
      onLogout();
    } catch (e) {
      if (e instanceof Error) showError(e.message);
    } finally { setDeleteLoading(false); }
  };

  const portalTitle = isAdmin
    ? portalPage === "support" ? "Chats y tickets"
      : portalPage === "adminPanel" ? "Panel"
      : portalPage === "adminContracts" ? "Contrataciones de clientes"
      : portalPage === "doubtChats" ? "Consultas de clientes"
      : portalPage === "adminRepairs" ? "Reparacion a distancia"
      : portalPage === "adminUsers" ? "Usuarios"
      : "Panel de administrador"
    : portalPage === "support" ? "Soporte técnico"
      : portalPage === "subscriptions" ? "Suscripciones y planes"
      : portalPage === "contracts" ? "Contrataciones"
      : portalPage === "payments" ? "Métodos de pago"
      : portalPage === "repair" ? "Reparación a distancia"
      : portalPage === "account" ? "Gestión de cuenta"
      : "Panel de cliente";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAdmin) {
    return (
      <AdminShell
        email={email}
        name={name}
        pathname={pathname}
        onNavigate={onNavigate}
        onGoHome={onGoHome}
        onLogout={onLogout}
        portalPage={portalPage}
        portalTitle={portalTitle}
        openCount={openCount}
        progressCount={progressCount}
        error={error}
        notice={notice}
      >
        {portalPage === "adminPanel" && (
          <AdminPanel
            registeredUsers={registeredUsers}
            services={services}
            adminSelectedEmail={adminSelectedEmail}
            setAdminSelectedEmail={setAdminSelectedEmail}
            adminSelectedPlanId={adminSelectedPlanId}
            setAdminSelectedPlanId={setAdminSelectedPlanId}
            adminSelectedServiceId={adminSelectedServiceId}
            setAdminSelectedServiceId={setAdminSelectedServiceId}
            adminEquipmentCount={adminEquipmentCount}
            setAdminEquipmentCount={setAdminEquipmentCount}
            adminAssignLoading={adminAssignLoading}
            handleAdminAssignPlan={handleAdminAssignPlan}
            handleAdminAssignService={handleAdminAssignService}
          />
        )}
        {portalPage === "adminUsers" && (
          <AdminUsers
            registeredUsers={registeredUsers}
            subscriptions={subscriptions}
            contracts={contracts}
            selectedUserEmail={selectedUserEmail}
            setSelectedUserEmail={setSelectedUserEmail}
            handleAdminCancelSubscription={handleAdminCancelSubscription}
            handleAdminCancelContract={handleAdminCancelContract}
            handleAdminDeleteUser={handleAdminDeleteUser}
          />
        )}
        {portalPage === "adminOverview" && (
          <AdminOverview
            adminClientCount={adminClientCount}
            openCount={openCount}
            progressCount={progressCount}
            activeContracts={activeContracts}
            tickets={tickets}
            setSelectedTicketId={setSelectedTicketId}
            onNavigate={onNavigate}
            handleDeleteTicket={handleDeleteTicket}
            statusLabel={statusLabel}
          />
        )}
        {portalPage === "support" && (
          <AdminSupport
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            setSelectedTicketId={setSelectedTicketId}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            email={email}
            selectedTicket={selectedTicket}
            handleStatusChange={handleStatusChange}
            handleSendMessage={handleSendMessage}
            handleDeleteTicket={handleDeleteTicket}
            chatBoxRef={chatBoxRef}
            statusLabel={statusLabel}
          />
        )}
        {portalPage === "adminContracts" && (
          <AdminContracts contracts={contracts} />
        )}
        {portalPage === "doubtChats" && (
          <AdminDoubtChats
            doubtSessions={doubtSessions}
            selectedSessionId={selectedSessionId}
            setSelectedSessionId={setSelectedSessionId}
            doubtMessages={doubtMessages}
            doubtReplyContent={doubtReplyContent}
            setDoubtReplyContent={setDoubtReplyContent}
            doubtLoading={doubtLoading}
            handleSelectSession={handleSelectSession}
            handleDoubtReply={handleDoubtReply}
            handleDeleteDoubtMessage={handleDeleteDoubtMessage}
            doubtChatBoxRef={doubtChatBoxRef}
          />
        )}
        {portalPage === "adminRepairs" && (
          <AdminRepairs
            repairs={repairs}
            handleUpdateRepairStatus={handleUpdateRepairStatus}
            handleDeleteRepair={handleDeleteRepair}
            statusLabel={statusLabel}
          />
        )}
      </AdminShell>
    );
  }

  return (
    <ClientShell
      email={email}
      name={name}
      pathname={pathname}
      onNavigate={onNavigate}
      onGoHome={onGoHome}
      onLogout={onLogout}
      portalPage={portalPage}
      portalTitle={portalTitle}
      activeSubscriptions={activeSubscriptions}
      downloadCoursePDF={downloadCoursePDF}
      openCount={openCount}
      progressCount={progressCount}
      closedCount={closedCount}
      error={error}
      notice={notice}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {portalPage === "clientOverview" && (
        <ClientOverview
          activeSubscriptions={activeSubscriptions}
          activeContracts={activeContracts}
          onNavigate={onNavigate}
          downloadCoursePDF={downloadCoursePDF}
        />
      )}
      {portalPage === "subscriptions" && (
        <ClientSubscriptions
          subscriptions={subscriptions}
          activeSubscriptions={activeSubscriptions}
          handleSubscribe={handleSubscribe}
          handleCancelSubscription={handleCancelSubscription}
          subLoading={subLoading}
          handleInitiateSubscribe={handleInitiateSubscribe}
          downloadCoursePDF={downloadCoursePDF}
        />
      )}
      {portalPage === "contracts" && (
        <ClientContracts
          services={services}
          contracts={contracts}
          equipmentByService={equipmentByService}
          setEquipmentByService={setEquipmentByService}
          handleContract={handleContract}
          handleContractUpdate={handleContractUpdate}
        />
      )}
      {portalPage === "support" && (
        <ClientSupport
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          setSelectedTicketId={setSelectedTicketId}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          email={email}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          loading={loading}
          selectedTicket={selectedTicket}
          handleCreateTicket={handleCreateTicket}
          handleSendMessage={handleSendMessage}
          chatBoxRef={chatBoxRef}
          statusLabel={statusLabel}
          statusDotClass={statusDotClass}
        />
      )}
      {portalPage === "account" && (
        <ClientAccount
          profile={profile}
          accountName={accountName}
          setAccountName={setAccountName}
          accountType={accountType}
          setAccountType={setAccountType}
          handleSaveAccount={handleSaveAccount}
          deleteStep={deleteStep}
          setDeleteStep={setDeleteStep}
          deleteCode={deleteCode}
          setDeleteCode={setDeleteCode}
          deleteLoading={deleteLoading}
          handleRequestDelete={handleRequestDelete}
          handleConfirmDelete={handleConfirmDelete}
          email={email}
        />
      )}
      {portalPage === "payments" && (
        <ClientPayments
          paymentMethods={paymentMethods}
          handleSavePayment={handleSavePayment}
          handleDeletePayment={handleDeletePayment}
          loading={loading}
          payType={payType}
          setPayType={setPayType}
          payAlias={payAlias}
          setPayAlias={setPayAlias}
          payLast4={payLast4}
          setPayLast4={setPayLast4}
          payHolder={payHolder}
          setPayHolder={setPayHolder}
          payExpiry={payExpiry}
          setPayExpiry={setPayExpiry}
          payCVV={payCVV}
          setPayCVV={setPayCVV}
          payPhone={payPhone}
          setPayPhone={setPayPhone}
          payIban={payIban}
          setPayIban={setPayIban}
        />
      )}
      {portalPage === "repair" && (
        <ClientRepair
          repairs={repairs}
          handleSendRepair={handleSendRepair}
          handleCancelRepair={handleCancelRepair}
          loading={loading}
          repairDevice={repairDevice}
          setRepairDevice={setRepairDevice}
          repairIssue={repairIssue}
          setRepairIssue={setRepairIssue}
          repairUrgency={repairUrgency}
          setRepairUrgency={setRepairUrgency}
        />
      )}
      {confirmHireData && (
        <ConfirmHireModal
          confirmHireData={confirmHireData}
          setConfirmHireData={setConfirmHireData}
          paymentMethods={paymentMethods}
          selectedPaymentMethodId={selectedPaymentMethodId}
          setSelectedPaymentMethodId={setSelectedPaymentMethodId}
          authTerms={authTerms}
          setAuthTerms={setAuthTerms}
          loading={loading}
          subLoading={subLoading}
          handleConfirmHire={handleConfirmHire}
          error={error}
          notice={notice}
        />
      )}
    </ClientShell>
  );
}

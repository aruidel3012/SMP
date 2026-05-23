export type Service = { id: string; name: string; description: string; price: string };
export type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  clientEmail: string;
  createdAt: string;
  updatedAt: string;
};
export type Message = {
  _id: string;
  senderRole: "client" | "admin";
  senderName?: string;
  senderEmail: string;
  replyToMessageId?: string;
  replyToContent?: string;
  replyToSenderName?: string;
  content: string;
  createdAt: string;
};
export type Contract = {
  _id: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  equipmentCount: number;
  status: "active" | "paused" | "cancelled";
  updatedAt: string;
};
export type Profile = {
  name: string;
  email: string;
  accountType: "empresa" | "particular";
  role: "client" | "admin";
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
};
export type Subscription = {
  _id: string;
  clientEmail: string;
  planId: string;
  planName: string;
  planType: "subscription" | "one_time";
  price: number;
  status: "active" | "cancelled" | "pending";
  startDate: string;
  endDate?: string | null;
};
export type PaymentMethod = {
  _id: string;
  type: "card" | "transfer" | "bizum";
  alias: string;
  last4: string;
  holderName: string;
  phone: string;
  iban: string;
};
export type RemoteRepair = {
  _id: string;
  deviceType: string;
  issue: string;
  urgency: "normal" | "high" | "critical";
  status: "pending" | "scheduled" | "in_progress" | "resolved" | "cancelled";
  clientEmail: string;
  clientName: string;
  createdAt: string;
  technicianNotes?: string;
};
export type DoubtMessage = {
  _id: string;
  senderName: string;
  content: string;
  isAdmin: boolean;
  sessionId: string;
  createdAt: string;
};
export type RegisteredUser = {
  _id: string;
  name: string;
  email: string;
  accountType: "empresa" | "particular";
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  createdAt: string;
};
export type ClientAreaProps = {
  email: string;
  name?: string;
  role?: "client" | "admin";
  pathname?: string;
  onNavigate?: (path: string) => void;
  onGoHome?: () => void;
  onLogout: () => void;
};
export type SubscriptionPlan = {
  id: string;
  name: string;
  type: "subscription" | "one_time";
  price: number;
  period: string;
  description: string;
  features: readonly string[];
  highlighted: boolean;
  color: string;
  badge: string | null;
};

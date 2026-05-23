import express from "express";
import User from "../models/User.ts";
import PasswordReset from "../models/PasswordReset.ts";
import Ticket from "../models/Ticket.ts";
import ChatMessage from "../models/ChatMessage.ts";
import Subscription from "../models/Subscription.ts";
import Contract from "../models/Contract.ts";
import PaymentMethod from "../models/PaymentMethod.ts";
import RemoteRepair from "../models/RemoteRepair.ts";
import DoubtChatMessage from "../models/DoubtChatMessage.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";
import { getPublicErrorMessage } from "../services/email.ts";
import { SUBSCRIPTION_PLANS, SERVICE_CATALOG } from "../config.ts";
import type { Request, Response } from "express";

const clientManagementRouter = express.Router();
clientManagementRouter.use(requireAuth, requireAdmin);

interface AssignPlanBody {
  email?: string;
  planId?: string;
}

interface AssignServiceBody {
  email?: string;
  serviceId?: string;
  equipmentCount?: number;
}

clientManagementRouter.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("name email accountType subscriptionPlan subscriptionStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

clientManagementRouter.post("/assign-plan", async (req: Request, res: Response) => {
  try {
    const { email, planId } = req.body as AssignPlanBody;
    const parsedEmail = (email || "").trim().toLowerCase();
    const parsedPlanId = (planId || "").trim();
    if (!parsedEmail || !parsedPlanId)
      return res.status(400).json({ message: "Email y plan son obligatorios." });
    const user = await User.findOne({ email: parsedEmail });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === parsedPlanId);
    if (!plan)
      return res.status(404).json({ message: "Plan no encontrado." });

    const existing = await Subscription.findOne({ clientId: user._id, planId: parsedPlanId, status: "active" });
    if (existing)
      return res.status(409).json({ message: "El usuario ya tiene este plan activo." });

    const subscription = await Subscription.create({
      clientId: user._id,
      clientEmail: user.email,
      planId: plan.id,
      planName: plan.name,
      planType: plan.type,
      price: plan.price,
      status: "active",
    });

    await User.findByIdAndUpdate(user._id, {
      subscriptionPlan: plan.id,
      subscriptionStatus: "active",
      subscriptionStartDate: new Date(),
    });

    res.status(201).json({ subscription, plan, user: { email: user.email, name: user.name } });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

clientManagementRouter.post("/assign-service", async (req: Request, res: Response) => {
  try {
    const { email, serviceId, equipmentCount } = req.body as AssignServiceBody;
    const parsedEmail = (email || "").trim().toLowerCase();
    const parsedServiceId = (serviceId || "").trim();
    const parsedEquipmentCount = Number(equipmentCount || 1);

    if (!parsedEmail || !parsedServiceId)
      return res.status(400).json({ message: "Email y servicio son obligatorios." });
    if (!Number.isInteger(parsedEquipmentCount) || parsedEquipmentCount < 1)
      return res.status(400).json({ message: "El numero de equipos debe ser mayor que 0." });

    const user = await User.findOne({ email: parsedEmail });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });

    const service = SERVICE_CATALOG.find((item) => item.id === parsedServiceId);
    if (!service)
      return res.status(404).json({ message: "Servicio no encontrado." });

    const existing = await Contract.findOne({
      clientId: user._id,
      serviceId: parsedServiceId,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      existing.equipmentCount = parsedEquipmentCount;
      existing.status = "active";
      await existing.save();
      return res.json({ contract: existing, updated: true });
    }

    const contract = await Contract.create({
      clientId: user._id,
      clientEmail: user.email,
      serviceId: service.id,
      serviceName: service.name,
      equipmentCount: parsedEquipmentCount,
      status: "active",
    });

    return res.status(201).json({ contract, updated: false });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

clientManagementRouter.delete("/users/:userId", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });
    if (user.role === "admin")
      return res.status(403).json({ message: "No se puede eliminar una cuenta de administrador." });

    const userEmail = user.email;
    await User.deleteOne({ _id: user._id });
    await PasswordReset.deleteMany({ email: userEmail });
    await Ticket.deleteMany({ clientId: user._id });
    await ChatMessage.deleteMany({ senderEmail: userEmail });
    await Subscription.deleteMany({ clientId: user._id });
    await Contract.deleteMany({ clientId: user._id });
    await PaymentMethod.deleteMany({ clientId: user._id });
    await RemoteRepair.deleteMany({ clientId: user._id });
    await DoubtChatMessage.deleteMany({ senderName: { $regex: userEmail, $options: "i" } });
    res.json({ message: "Usuario eliminado permanentemente." });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default clientManagementRouter;

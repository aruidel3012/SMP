import express from "express";
import Subscription from "../models/Subscription.ts";
import User from "../models/User.ts";
import PaymentMethod from "../models/PaymentMethod.ts";
import { requireAuth } from "../middleware/auth.ts";
import { getPublicErrorMessage, sendSubscriptionEmail } from "../services/email.ts";
import { SUBSCRIPTION_PLANS } from "../config.ts";
import type { Request, Response } from "express";

const subscriptionsRouter = express.Router();
subscriptionsRouter.use(requireAuth);

subscriptionsRouter.get("/plans", (_req: Request, res: Response) => {
  res.json({ plans: SUBSCRIPTION_PLANS });
});

subscriptionsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.user!.role === "admin" ? {} : { clientId: req.user!.sub };
    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ subscriptions });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

subscriptionsRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res
        .status(403)
        .json({ message: "Las cuentas admin no pueden suscribirse." });
    const { planId } = req.body as { planId?: string };
    const pmCount = await PaymentMethod.countDocuments({ clientId: req.user!.sub });
    if (pmCount === 0) {
      return res.status(400).json({ message: "Debes registrar al menos un método de pago antes de suscribirte." });
    }
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) return res.status(404).json({ message: "Plan no encontrado." });

    if (plan.type === "subscription") {
      const existing = await Subscription.findOne({
        clientId: req.user!.sub,
        planId,
        status: "active",
      });
      if (existing)
        return res.status(409).json({ message: "Ya tienes este plan activo." });
    }

    const subscription = await Subscription.create({
      clientId: req.user!.sub,
      clientEmail: req.user!.email,
      planId: plan.id,
      planName: plan.name,
      planType: plan.type,
      price: plan.price,
      status: "active",
    });

    await User.findByIdAndUpdate(req.user!.sub, {
      subscriptionPlan: plan.id,
      subscriptionStatus: "active",
      subscriptionStartDate: new Date(),
    });

    try {
      await sendSubscriptionEmail(req.user!.email, plan.name, plan.type);
    } catch (err) { console.error(err); }

    res.status(201).json({ subscription, plan });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

subscriptionsRouter.patch("/:subscriptionId/cancel", async (req: Request, res: Response) => {
  try {
    const sub = await Subscription.findById(req.params.subscriptionId);
    if (!sub)
      return res.status(404).json({ message: "Suscripción no encontrada." });
    if (req.user!.role !== "admin" && sub.clientId.toString() !== req.user!.sub)
      return res
        .status(403)
        .json({ message: "No tienes acceso a esta suscripción." });

    sub.status = "cancelled";
    sub.endDate = new Date();
    await sub.save();

    const remaining = await Subscription.findOne({
      clientId: sub.clientId,
      status: "active",
    });
    if (!remaining)
      await User.findByIdAndUpdate(sub.clientId, {
        subscriptionStatus: "cancelled",
      });

    res.json({ subscription: sub });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default subscriptionsRouter;

import express from "express";
import PaymentMethod from "../models/PaymentMethod.ts";
import { requireAuth } from "../middleware/auth.ts";
import { getPublicErrorMessage } from "../services/email.ts";
import type { Request, Response } from "express";

interface PaymentMethodBody {
  type?: string;
  alias?: string;
  last4?: string;
  holderName?: string;
  phone?: string;
  iban?: string;
}

const paymentsRouter = express.Router();
paymentsRouter.use(requireAuth);

paymentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res.json({ methods: [] });
    const methods = await PaymentMethod.find({ clientId: req.user!.sub }).lean();
    res.json({ methods });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

paymentsRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res.status(403).json({ message: "Admin no puede añadir métodos de pago." });
    const { type, alias, last4, holderName, phone, iban } = req.body as PaymentMethodBody;

    if (type === "card") {
      if (!last4 || !/^\d{4}$/.test(last4.trim())) {
        return res.status(400).json({ message: "Debes introducir los últimos 4 dígitos de la tarjeta." });
      }
      if (!holderName || holderName.trim().length < 3) {
        return res.status(400).json({ message: "El nombre del titular es obligatorio." });
      }
    } else if (type === "bizum") {
      if (!phone || phone.trim().length < 9) {
        return res.status(400).json({ message: "Debes introducir un teléfono de Bizum válido." });
      }
    } else if (type === "transfer") {
      if (!iban || iban.trim().length < 4) {
        return res.status(400).json({ message: "Debes introducir un IBAN o cuenta válida." });
      }
    }
    const allowed = ["card", "transfer", "bizum"];
    if (!allowed.includes(type!))
      return res.status(400).json({ message: "Tipo de método de pago no válido." });

    const existing = await PaymentMethod.findOne({ clientId: req.user!.sub, type });
    if (existing) {
      existing.alias = (alias || "").trim();
      existing.last4 = (last4 || "").trim();
      existing.holderName = (holderName || "").trim();
      existing.phone = (phone || "").trim();
      existing.iban = (iban || "").trim();
      await existing.save();
      return res.json({ method: existing, updated: true });
    }
    const method = await PaymentMethod.create({
      clientId: req.user!.sub,
      clientEmail: req.user!.email,
      type,
      alias: (alias || "").trim(),
      last4: (last4 || "").trim(),
      holderName: (holderName || "").trim(),
      phone: (phone || "").trim(),
      iban: (iban || "").trim(),
    });
    res.status(201).json({ method, updated: false });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

paymentsRouter.delete("/:methodId", async (req: Request, res: Response) => {
  try {
    const method = await PaymentMethod.findById(req.params.methodId);
    if (!method) return res.status(404).json({ message: "Método no encontrado." });
    if (req.user!.role !== "admin" && method.clientId.toString() !== req.user!.sub)
      return res.status(403).json({ message: "Sin acceso." });
    await method.deleteOne();
    res.json({ ok: true });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default paymentsRouter;

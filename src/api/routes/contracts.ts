import express from "express";
import Contract from "../models/Contract.ts";
import PaymentMethod from "../models/PaymentMethod.ts";
import { requireAuth } from "../middleware/auth.ts";
import { getPublicErrorMessage } from "../services/email.ts";
import { SERVICE_CATALOG } from "../config.ts";
import type { Request, Response } from "express";

const contractsRouter = express.Router();
contractsRouter.use(requireAuth);

contractsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.user!.role === "admin" ? {} : { clientId: req.user!.sub };
    const contracts = await Contract.find(query).sort({ updatedAt: -1 }).lean();
    res.json({ contracts });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

contractsRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res
        .status(403)
        .json({ message: "Las cuentas admin no pueden contratar servicios." });
    const { serviceId, equipmentCount } = req.body as { serviceId?: string; equipmentCount?: number };
    const parsedServiceId = (serviceId || "").trim();
    const pmCount = await PaymentMethod.countDocuments({ clientId: req.user!.sub });
    if (pmCount === 0) {
      return res.status(400).json({ message: "Debes registrar al menos un método de pago antes de contratar este servicio." });
    }
    const parsedEquipmentCount = Number(equipmentCount);
    if (!parsedServiceId)
      return res.status(400).json({ message: "Servicio no válido." });
    if (!Number.isInteger(parsedEquipmentCount) || parsedEquipmentCount < 1)
      return res
        .status(400)
        .json({
          message: "El número de equipos debe ser un entero mayor que 0.",
        });

    const service = SERVICE_CATALOG.find((s) => s.id === parsedServiceId);
    if (!service)
      return res.status(404).json({ message: "Servicio no encontrado." });

    const existing = await Contract.findOne({
      clientId: req.user!.sub,
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
      clientId: req.user!.sub,
      clientEmail: req.user!.email,
      serviceId: service.id,
      serviceName: service.name,
      equipmentCount: parsedEquipmentCount,
    });
    return res.status(201).json({ contract, updated: false });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

contractsRouter.patch("/:contractId", async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract)
      return res.status(404).json({ message: "Contrato no encontrado." });
    if (
      req.user!.role !== "admin" &&
      contract.clientId.toString() !== req.user!.sub
    )
      return res
        .status(403)
        .json({ message: "No tienes acceso a este contrato." });

    const body = req.body as { equipmentCount?: number; status?: string };
    if (body.equipmentCount !== undefined) {
      const equipmentCount = Number(body.equipmentCount);
      if (!Number.isInteger(equipmentCount) || equipmentCount < 1)
        return res
          .status(400)
          .json({ message: "El número de equipos debe ser mayor que 0." });
      contract.equipmentCount = equipmentCount;
    }
    if (body.status) {
      if (!["active", "paused", "cancelled"].includes(body.status))
        return res
          .status(400)
          .json({ message: "Estado de contrato no válido." });
      contract.status = body.status as "active" | "paused" | "cancelled";
    }
    await contract.save();
    res.json({ contract });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default contractsRouter;

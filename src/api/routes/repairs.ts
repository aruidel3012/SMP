import express from "express";
import RemoteRepair from "../models/RemoteRepair.ts";
import User from "../models/User.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";
import { getPublicErrorMessage } from "../services/email.ts";
import type { Request, Response } from "express";

const repairsRouter = express.Router();
repairsRouter.use(requireAuth);

repairsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query: Record<string, unknown> = {};
    if (req.user!.role === "admin") {
      if (req.query.urgency && ["normal", "high", "critical"].includes(req.query.urgency as string)) {
        query.urgency = req.query.urgency;
      }
    } else {
      query.clientId = req.user!.sub;
    }
    const repairs = await RemoteRepair.find(query).sort({ createdAt: -1 }).lean();
    res.json({ repairs });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

repairsRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res.status(403).json({ message: "Admin no puede crear solicitudes de reparación." });
    const { deviceType, issue, urgency } = req.body as { deviceType?: string; issue?: string; urgency?: string };
    const allowed = ["pc", "laptop", "server", "mobile", "network", "other"];
    if (!allowed.includes(deviceType!))
      return res.status(400).json({ message: "Tipo de dispositivo no válido." });
    const parsedIssue = (issue || "").trim();
    if (parsedIssue.length < 10)
      return res.status(400).json({ message: "Describe el problema con al menos 10 caracteres." });
    const parsedUrgency = ["normal", "high", "critical"].includes(urgency!) ? urgency! : "normal";

    let clientName = req.user!.name || "";
    if (!clientName && req.user!.sub) {
      const u = await User.findById(req.user!.sub).select("name");
      clientName = u?.name || "";
    }

    const repair = await RemoteRepair.create({
      clientId: req.user!.sub,
      clientEmail: req.user!.email,
      clientName,
      deviceType,
      issue: parsedIssue,
      urgency: parsedUrgency,
      status: "pending",
    });
    res.status(201).json({ repair });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

repairsRouter.patch("/:repairId/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allowed = ["pending", "scheduled", "in_progress", "resolved", "cancelled"];
    const { status, scheduledAt, technicianNotes } = req.body as { status?: string; scheduledAt?: string; technicianNotes?: string };
    if (!allowed.includes(status!))
      return res.status(400).json({ message: "Estado no válido." });
    const repair = await RemoteRepair.findByIdAndUpdate(
      req.params.repairId,
      {
        status,
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
        ...(technicianNotes !== undefined ? { technicianNotes } : {}),
      },
      { new: true },
    );
    if (!repair) return res.status(404).json({ message: "Solicitud no encontrada." });
    res.json({ repair });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

repairsRouter.delete("/:repairId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const repair = await RemoteRepair.findByIdAndDelete(req.params.repairId);
    if (!repair) return res.status(404).json({ message: "Solicitud no encontrada." });
    res.json({ message: "Solicitud eliminada." });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

repairsRouter.patch("/:repairId/cancel", async (req: Request, res: Response) => {
  try {
    const repair = await RemoteRepair.findById(req.params.repairId);
    if (!repair) return res.status(404).json({ message: "Solicitud no encontrada." });
    if (req.user!.role !== "admin" && repair.clientId.toString() !== req.user!.sub)
      return res.status(403).json({ message: "Sin acceso." });
    repair.status = "cancelled";
    await repair.save();
    res.json({ repair });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default repairsRouter;

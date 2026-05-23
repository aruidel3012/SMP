import express from "express";
import Ticket from "../models/Ticket.ts";
import ChatMessage from "../models/ChatMessage.ts";
import User from "../models/User.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";
import { getPublicErrorMessage } from "../services/email.ts";
import { SERVICE_CATALOG } from "../config.ts";
import type { Request, Response } from "express";

interface ReplyMeta {
  replyToMessageId?: string;
  replyToContent?: string;
  replyToSenderName?: string;
}

const ticketsRouter = express.Router();
ticketsRouter.use(requireAuth);

ticketsRouter.get("/services", (_req: Request, res: Response) =>
  res.json({ services: SERVICE_CATALOG }),
);

ticketsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.user!.role === "admin" ? {} : { clientId: req.user!.sub };
    const tickets = await Ticket.find(query).sort({ updatedAt: -1 }).lean();
    res.json({ tickets });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

ticketsRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res
        .status(403)
        .json({
          message: "Las cuentas admin no pueden crear tickets de cliente.",
        });
    const { title, description } = req.body as { title?: string; description?: string };
    const parsedTitle = (title || "").trim();
    const parsedDescription = (description || "").trim();
    if (parsedTitle.length < 5)
      return res
        .status(400)
        .json({ message: "El asunto debe tener al menos 5 caracteres." });
    if (parsedDescription.length < 10)
      return res
        .status(400)
        .json({ message: "La descripción debe tener al menos 10 caracteres." });
    const ticket = await Ticket.create({
      title: parsedTitle,
      description: parsedDescription,
      clientId: req.user!.sub,
      clientEmail: req.user!.email,
      status: "open",
    });
    res.status(201).json({ ticket });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

ticketsRouter.patch("/:ticketId/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allowed = ["open", "in_progress", "closed"];
    const { status } = req.body as { status?: string };
    const nextStatus = (status || "").trim();
    if (!allowed.includes(nextStatus))
      return res.status(400).json({ message: "Estado de ticket no válido." });
    const updated = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { status: nextStatus },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Ticket no encontrado." });
    res.json({ ticket: updated });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

ticketsRouter.delete("/:ticketId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.ticketId);
    if (!deleted)
      return res.status(404).json({ message: "Ticket no encontrado." });
    await ChatMessage.deleteMany({ ticketId: req.params.ticketId });
    res.json({ message: "Ticket eliminado correctamente." });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

ticketsRouter.get("/:ticketId/messages", async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket)
      return res.status(404).json({ message: "Ticket no encontrado." });
    if (
      req.user!.role !== "admin" &&
      ticket.clientId.toString() !== req.user!.sub.toString()
    )
      return res
        .status(403)
        .json({ message: "No tienes acceso a este ticket." });
    const messages = await ChatMessage.find({ ticketId: req.params.ticketId })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ messages });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

ticketsRouter.post("/:ticketId/messages", async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { content, replyToMessageId } = req.body as { content?: string; replyToMessageId?: string };
    const parsedContent = (content || "").trim();
    const parsedReplyToMessageId = (replyToMessageId || "").trim();
    if (!parsedContent)
      return res
        .status(400)
        .json({ message: "El mensaje no puede estar vacío." });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket)
      return res.status(404).json({ message: "Ticket no encontrado." });
    if (
      req.user!.role !== "admin" &&
      ticket.clientId.toString() !== req.user!.sub.toString()
    )
      return res
        .status(403)
        .json({ message: "No tienes acceso a este ticket." });

    let senderName = req.user!.name || "";
    if (!senderName && req.user!.role !== "admin" && req.user!.sub) {
      const senderUser = await User.findById(req.user!.sub).select("name");
      senderName = senderUser?.name || "";
    }
    if (!senderName)
      senderName = req.user!.role === "admin" ? "Administrador SMP" : "Usuario";

    let replyMeta: ReplyMeta = {};
    if (parsedReplyToMessageId) {
      const replySource = await ChatMessage.findOne({
        _id: parsedReplyToMessageId,
        ticketId,
      }).lean();
      if (replySource) {
        replyMeta = {
          replyToMessageId: (replySource as Record<string, unknown>)._id as string,
          replyToContent: ((replySource as Record<string, unknown>).content as string || "").slice(0, 180),
          replyToSenderName: (replySource as Record<string, unknown>).senderName as string || (replySource as Record<string, unknown>).senderEmail as string,
        };
      }
    }

    const message = await ChatMessage.create({
      ticketId,
      senderRole: req.user!.role === "admin" ? "admin" : "client",
      senderName,
      senderEmail: req.user!.email,
      ...replyMeta,
      content: parsedContent,
    });
    await Ticket.findByIdAndUpdate(ticketId, { updatedAt: new Date() });
    return res.status(201).json({ message });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default ticketsRouter;

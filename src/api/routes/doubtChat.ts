import express from "express";
import jwt from "jsonwebtoken";
import DoubtChatMessage from "../models/DoubtChatMessage.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";
import { getPublicErrorMessage } from "../services/email.ts";
import type { Request, Response } from "express";

const doubtChatRouter = express.Router();

doubtChatRouter.get("/", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    let isAdmin = false;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { role?: string };
        if (payload.role === "admin") isAdmin = true;
      } catch (err) { console.error(err); }
    }

    const sessionId = ((req.query.sessionId as string) || "").trim();
    let filter: Record<string, unknown> = {};
    if (sessionId) {
      filter = { sessionId };
    } else if (!isAdmin) {
      return res.json({ messages: [] });
    }

    const messages = await DoubtChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ messages: messages.reverse() });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

doubtChatRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { senderName, content, sessionId } = req.body as { senderName?: string; content?: string; sessionId?: string };
    const parsedSenderName = (senderName || "").trim();
    const parsedContent = (content || "").trim();
    const parsedSessionId = (sessionId || "").trim();
    if (!parsedSenderName || parsedSenderName.length < 2)
      return res.status(400).json({ message: "El nombre debe tener al menos 2 caracteres." });
    if (!parsedContent || parsedContent.length < 3)
      return res.status(400).json({ message: "La consulta debe tener al menos 3 caracteres." });
    if (!parsedSessionId)
      return res.status(400).json({ message: "Session ID requerido." });
    const message = await DoubtChatMessage.create({ senderName: parsedSenderName, content: parsedContent, sessionId: parsedSessionId });
    res.status(201).json({ message });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

doubtChatRouter.delete("/:messageId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await DoubtChatMessage.findByIdAndDelete(req.params.messageId);
    if (!deleted)
      return res.status(404).json({ message: "Mensaje no encontrado." });
    res.json({ message: "Mensaje eliminado." });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

doubtChatRouter.get("/sessions", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const sessions = await DoubtChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$sessionId",
          senderName: { $first: "$senderName" },
          lastMessage: { $first: "$content" },
          messageCount: { $sum: 1 },
          createdAt: { $first: "$createdAt" },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json({ sessions });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

doubtChatRouter.delete("/session/:sessionId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await DoubtChatMessage.deleteMany({ sessionId: req.params.sessionId });
    res.json({ message: `${result.deletedCount} mensajes eliminados.` });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

doubtChatRouter.post("/session/:sessionId/reply", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { content } = req.body as { content?: string };
    const replyContent = (content || "").trim();
    if (!replyContent)
      return res.status(400).json({ message: "La respuesta no puede estar vacia." });

    const reply = await DoubtChatMessage.create({
      senderName: "Administrador SMP",
      content: replyContent,
      sessionId: req.params.sessionId,
      isAdmin: true,
    });

    res.status(201).json({ message: reply });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default doubtChatRouter;

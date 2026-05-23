import express from "express";
import User from "../models/User.ts";
import PasswordReset from "../models/PasswordReset.ts";
import Ticket from "../models/Ticket.ts";
import ChatMessage from "../models/ChatMessage.ts";
import Subscription from "../models/Subscription.ts";
import Contract from "../models/Contract.ts";
import PaymentMethod from "../models/PaymentMethod.ts";
import RemoteRepair from "../models/RemoteRepair.ts";
import { requireAuth } from "../middleware/auth.ts";
import { getPublicErrorMessage, buildCodeData, sendVerificationEmail } from "../services/email.ts";
import { ACCOUNT_TYPES } from "../config.ts";
import type { Request, Response } from "express";

const accountRouter = express.Router();
accountRouter.use(requireAuth);

accountRouter.get("/profile", async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "admin")
      return res.json({
        profile: {
          name: req.user!.name || "Administrador SMP",
          email: req.user!.email,
          accountType: "empresa",
          role: "admin",
        },
      });
    const user = await User.findById(req.user!.sub).select(
      "name email accountType role createdAt subscriptionPlan subscriptionStatus",
    );
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });
    res.json({ profile: user });
  } catch (err: unknown) {
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

accountRouter.patch("/profile", async (req: Request, res: Response) => {
    try {
      if (req.user!.role === "admin")
        return res
          .status(403)
          .json({ message: "La cuenta admin no se edita desde este panel." });
      const { name, accountType } = req.body as { name?: string; accountType?: string };
      const parsedName = (name || "").trim();
      const parsedAccountType = (accountType || "").trim().toLowerCase();
      if (parsedName.length < 2)
        return res
          .status(400)
          .json({ message: "El nombre debe tener al menos 2 caracteres." });
      if (!ACCOUNT_TYPES.includes(parsedAccountType))
        return res.status(400).json({ message: "Tipo de cuenta inválido." });

      const user = await User.findById(req.user!.sub);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado." });
      user.name = parsedName;
      user.accountType = parsedAccountType;
      await user.save();
      res.json({
        profile: {
          name: user.name,
          email: user.email,
          accountType: user.accountType,
          role: user.role,
        },
      });
    } catch (err: unknown) {
      res.status(500).json({ message: getPublicErrorMessage(err) });
    }
  });

  accountRouter.post("/request-deletion", async (req: Request, res: Response) => {
    try {
      if (req.user!.role === "admin")
        return res.status(403).json({ message: "La cuenta admin no puede eliminarse desde aqui." });
      const user = await User.findById(req.user!.sub);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado." });

      const { code, expiry } = buildCodeData();
      user.deleteCode = code;
      user.deleteCodeExpiry = expiry;
      await user.save();

      await sendVerificationEmail(user.email, code, expiry);
      res.json({ message: "Codigo de verificacion enviado a tu correo.", expiresAt: expiry });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message === "EMAIL_MISSING_CONFIG")
        return res.status(500).json({ message: "Falta configuracion de email (RESEND_API_KEY) en .env." });
      res.status(500).json({ message: getPublicErrorMessage(err) });
    }
  });

  accountRouter.post("/confirm-deletion", async (req: Request, res: Response) => {
    try {
      if (req.user!.role === "admin")
        return res.status(403).json({ message: "La cuenta admin no puede eliminarse desde aqui." });
      const { code } = req.body as { code?: string };
      const parsedCode = (code || "").toString().trim();
      if (!parsedCode || !/^\d{6}$/.test(parsedCode))
        return res.status(400).json({ message: "El codigo debe tener 6 digitos." });

      const user = await User.findById(req.user!.sub);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado." });

      if (!user.deleteCode || !user.deleteCodeExpiry)
        return res.status(400).json({ message: "No hay codigo de eliminacion pendiente. Solicita uno primero." });

      if (user.deleteCodeExpiry < new Date())
        return res.status(400).json({ message: "El codigo ha expirado. Solicita uno nuevo." });

      if (user.deleteCode !== parsedCode)
        return res.status(400).json({ message: "Codigo incorrecto." });

      const userEmail = user.email;
      await User.deleteOne({ _id: req.user!.sub });
      await PasswordReset.deleteOne({ email: userEmail });
      await Ticket.deleteMany({ clientId: req.user!.sub });
      await ChatMessage.deleteMany({ senderEmail: userEmail });
      await Subscription.deleteMany({ clientId: req.user!.sub });
      await Contract.deleteMany({ clientId: req.user!.sub });
      await PaymentMethod.deleteMany({ clientId: req.user!.sub });
      await RemoteRepair.deleteMany({ clientId: req.user!.sub });
      return res.json({ message: "Cuenta eliminada permanentemente." });
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ message: getPublicErrorMessage(err) });
    }
  });

export default accountRouter;

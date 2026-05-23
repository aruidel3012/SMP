import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import PendingRegistration from "../models/PendingRegistration.ts";
import PasswordReset from "../models/PasswordReset.ts";
import { ACCOUNT_TYPES, EMAIL_VERIFICATION_REQUIRED, isAdminEmail, PRIMARY_ADMIN_EMAIL, ADMIN_LOGIN_EMAIL, ADMIN_LOGIN_EMAIL_ALT, ADMIN_LOGIN_PASSWORD } from "../config.ts";
import { validateEmail } from "../middleware/email.ts";
import { hasEmailConfig, getPublicErrorMessage, buildCodeData, signSessionToken, sendVerificationEmail, sendPasswordResetEmail } from "../services/email.ts";
import { Resend } from "resend";
import type { Request, Response } from "express";

const authRouter = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY!);

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
  accountType?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface VerifyBody {
  email?: string;
  code?: string;
}

interface ResetPasswordBody {
  email?: string;
  code?: string;
  newPassword?: string;
}

authRouter.get("/debug-email", async (_req: Request, res: Response) => {
  try {
    const config = {
      apiKey: process.env.RESEND_API_KEY ? "re_****" + process.env.RESEND_API_KEY.slice(-4) : "not set",
      from: process.env.EMAIL_FROM || "SMP <onboarding@resend.dev>"
    };
    if (!hasEmailConfig()) {
      return res.status(500).json({ 
        success: false, 
        config, 
        error: "RESEND_API_KEY no configurada o inválida" 
      });
    }
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "SMP <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "admin@smp.es",
      subject: "Test de conexión Resend - SMP",
      html: "<p>Si recibes este email, la configuración de Resend es correcta.</p>"
    });
    res.json({ success: true, config, message: "Conexión Resend exitosa" });
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number; code?: string };
    res.status(500).json({ 
      success: false, 
      config: {
        apiKey: process.env.RESEND_API_KEY ? "re_****" + process.env.RESEND_API_KEY.slice(-4) : "not set"
      }, 
      error: error.message, 
      code: error.statusCode || error.code 
    });
  }
});

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, accountType } = req.body as RegisterBody;
    const parsedName = (name || "").trim();
    const parsedAccountType = (accountType || "").trim().toLowerCase();
    const parsedEmail = (email || "").trim().toLowerCase();

    if (!parsedName || parsedName.length < 2)
      return res
        .status(400)
        .json({ message: "El nombre es obligatorio (mínimo 2 caracteres)." });
    if (!ACCOUNT_TYPES.includes(parsedAccountType))
      return res
        .status(400)
        .json({
          message: "Debes indicar si la cuenta es empresa o particular.",
        });
    if (!parsedEmail || !password)
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios." });
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 8 caracteres." });

    const emailCheck = await validateEmail(parsedEmail);
    if (!emailCheck.valid)
      return res.status(400).json({ message: emailCheck.reason });
    if (await User.findOne({ email: parsedEmail }))
      return res
        .status(409)
        .json({ message: "Este correo ya está registrado." });

    const { code, expiry } = buildCodeData();

    if (EMAIL_VERIFICATION_REQUIRED) {
      const passwordHash = await bcrypt.hash(password, 12);
      await PendingRegistration.findOneAndUpdate(
        { email: parsedEmail },
        {
          name: parsedName,
          accountType: parsedAccountType,
          email: parsedEmail,
          passwordHash,
          verifyCode: code,
          verifyCodeExpiry: expiry,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      await sendVerificationEmail(parsedEmail, code, expiry);
      return res
        .status(201)
        .json({
          message: "Código enviado. Revisa tu bandeja de entrada.",
          requiresVerification: true,
          expiresAt: expiry,
        });
    }

    const user = await User.create({
      name: parsedName,
      accountType: parsedAccountType,
      email: parsedEmail,
      password,
      verified: true,
      role: isAdminEmail(parsedEmail) ? "admin" : "client",
    });
    const token = signSessionToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
    });
    res
      .status(201)
      .json({
        message: "Cuenta creada.",
        requiresVerification: false,
        token,
        user: {
          email: user.email,
          name: user.name,
          accountType: user.accountType,
          createdAt: user.createdAt,
          role: user.role,
        },
      });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error && err.message === "EMAIL_MISSING_CONFIG")
      return res
        .status(500)
        .json({ message: "Falta configuración de email (RESEND_API_KEY) en .env." });
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

authRouter.post("/resend-code", async (req: Request, res: Response) => {
  try {
    if (!EMAIL_VERIFICATION_REQUIRED)
      return res
        .status(400)
        .json({ message: "Verificación por correo desactivada." });
    const { email } = req.body as { email?: string };
    const parsedEmail = (email || "").trim().toLowerCase();
    if (!parsedEmail)
      return res.status(400).json({ message: "El email es obligatorio." });

    const emailCheck = await validateEmail(parsedEmail);
    if (!emailCheck.valid)
      return res.status(400).json({ message: emailCheck.reason });
    if (await User.findOne({ email: parsedEmail }))
      return res
        .status(400)
        .json({ message: "Esta cuenta ya está verificada." });

    const pending = await PendingRegistration.findOne({ email: parsedEmail });
    if (!pending)
      return res
        .status(404)
        .json({ message: "No existe un registro pendiente para este correo." });

    const { code, expiry } = buildCodeData();
    pending.verifyCode = code;
    pending.verifyCodeExpiry = expiry;
    await pending.save();
    await sendVerificationEmail(parsedEmail, code, expiry);
    res.json({ message: "Código reenviado.", expiresAt: expiry });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error && err.message === "EMAIL_MISSING_CONFIG")
      return res
        .status(500)
        .json({ message: "Falta configuración de email (RESEND_API_KEY) en .env." });
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

authRouter.post("/verify", async (req: Request, res: Response) => {
  try {
    if (!EMAIL_VERIFICATION_REQUIRED)
      return res
        .status(400)
        .json({ message: "Verificación por correo desactivada." });

    const { email, code } = req.body as VerifyBody;
    const parsedEmail = (email || "").trim().toLowerCase();
    const parsedCode = (code || "").toString().trim();

    if (!parsedEmail || !parsedCode)
      return res
        .status(400)
        .json({ message: "Email y código son obligatorios." });
    if (!/^\d{6}$/.test(parsedCode))
      return res
        .status(400)
        .json({ message: "El código debe tener 6 dígitos." });
    if (await User.findOne({ email: parsedEmail }))
      return res
        .status(400)
        .json({ message: "Esta cuenta ya está registrada y verificada." });

    const pending = await PendingRegistration.findOne({ email: parsedEmail });
    if (!pending)
      return res
        .status(404)
        .json({ message: "El código ha expirado o no existe.", expired: true });
    if (pending.verifyCodeExpiry < new Date())
      return res
        .status(400)
        .json({ message: "El código ha expirado.", expired: true });
    if (pending.verifyCode !== parsedCode)
      return res.status(400).json({ message: "Código incorrecto." });

    const user = new User({
      name: pending.name,
      accountType: pending.accountType,
      email: pending.email,
      password: pending.passwordHash,
      verified: true,
      role: isAdminEmail(pending.email) ? "admin" : "client",
    });
    user.$locals.passwordAlreadyHashed = true;
    await user.save();
    await PendingRegistration.deleteOne({ _id: pending._id });

    const token = signSessionToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
    });
    res.json({
      message: "¡Cuenta verificada correctamente!",
      token,
      user: {
        email: user.email,
        name: user.name,
        accountType: user.accountType,
        createdAt: user.createdAt,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;
    const parsedEmail = (email || "").trim().toLowerCase();
    if (!parsedEmail || !password)
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios." });

    const adminCandidates = [
      PRIMARY_ADMIN_EMAIL,
      ADMIN_LOGIN_EMAIL.toLowerCase(),
      ADMIN_LOGIN_EMAIL_ALT.toLowerCase(),
    ];
    if (
      adminCandidates.includes(parsedEmail) &&
      password === ADMIN_LOGIN_PASSWORD
    ) {
      const token = signSessionToken({
        sub: "admin-root",
        role: "admin",
        email: parsedEmail,
        name: "Administrador SMP",
        accountType: "empresa",
      });
      return res.json({
        message: "Sesión de administrador iniciada.",
        token,
        user: {
          email: parsedEmail,
          name: "Administrador SMP",
          accountType: "empresa",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      });
    }

    const user = await User.findOne({ email: parsedEmail });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Credenciales incorrectas." });
    if (!user.verified)
      return res
        .status(403)
        .json({ message: "Cuenta no verificada. Revisa tu correo." });

    const sessionRole = isAdminEmail(user.email) ? "admin" : user.role || "client";
    if (user.role !== sessionRole) {
      user.role = sessionRole;
      await user.save();
    }

    const token = signSessionToken({
      sub: user._id.toString(),
      role: sessionRole,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
    });
    res.json({
      message: "Sesión iniciada correctamente.",
      token,
      user: {
        email: user.email,
        name: user.name,
        accountType: user.accountType,
        createdAt: user.createdAt,
        role: sessionRole,
      },
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    const parsedEmail = (email || "").trim().toLowerCase();
    if (!parsedEmail)
      return res.status(400).json({ message: "El email es obligatorio." });

    const user = await User.findOne({ email: parsedEmail });
    if (!user)
      return res
        .status(404)
        .json({ message: "No existe una cuenta asociada a ese correo." });

    const { code, expiry } = buildCodeData();
    await PasswordReset.findOneAndUpdate(
      { email: parsedEmail },
      { email: parsedEmail, resetCode: code, resetCodeExpiry: expiry },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await sendPasswordResetEmail(parsedEmail, code, expiry);
    return res.json({
      message: "Código enviado. Revisa tu correo.",
      expiresAt: expiry,
    });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error && err.message === "EMAIL_MISSING_CONFIG")
      return res
        .status(500)
        .json({ message: "Falta configuración de email (RESEND_API_KEY) en .env." });
    return res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body as ResetPasswordBody;
    const parsedEmail = (email || "").trim().toLowerCase();
    const parsedCode = (code || "").toString().trim();

    if (!parsedEmail || !parsedCode || !newPassword)
      return res
        .status(400)
        .json({
          message: "Email, código y nueva contraseña son obligatorios.",
        });
    if (!/^\d{6}$/.test(parsedCode))
      return res
        .status(400)
        .json({ message: "El código debe tener 6 dígitos." });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 8 caracteres." });

    const registeredUser = await User.findOne({ email: parsedEmail });
    if (!registeredUser)
      return res
        .status(404)
        .json({ message: "No se encuentra una cuenta registrada con ese correo." });

    const reset = await PasswordReset.findOne({ email: parsedEmail });
    if (!reset)
      return res
        .status(404)
        .json({ message: "El código ha expirado o no existe." });
    if (reset.resetCodeExpiry < new Date())
      return res
        .status(400)
        .json({ message: "El código ha expirado. Solicita uno nuevo." });
    if (reset.resetCode !== parsedCode)
      return res.status(400).json({ message: "Código incorrecto." });

    registeredUser.password = newPassword;
    await registeredUser.save();
    await PasswordReset.deleteOne({ _id: reset._id });
    return res.json({ message: "Contraseña restablecida correctamente." });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: getPublicErrorMessage(err) });
  }
});

export default authRouter;

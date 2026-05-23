import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  name?: string;
  accountType?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token)
    return res
      .status(401)
      .json({ message: "Token de autenticación requerido." });
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("Falta JWT_SECRET");
    req.user = jwt.verify(token, jwtSecret) as JwtPayload;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Token inválido o expirado. Inicia sesión de nuevo." });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso restringido al administrador." });
  }
  next();
}

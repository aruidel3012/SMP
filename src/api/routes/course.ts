import { Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.ts";
import Subscription from "../models/Subscription.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/download", requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      clientId: req.user!.sub,
      planId: "learning",
      status: "active",
    });

    if (!subscription) {
      return res.status(403).json({ message: "No tienes acceso al curso. Necesitas el plan Learning activo." });
    }

    const pdfPath = path.join(__dirname, "..", "..", "..", "Manual_Soporte_Informatico_SMP.pdf");

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "El archivo del curso no está disponible." });
    }

    res.download(pdfPath, "Manual_Soporte_Informatico_SMP.pdf");
  } catch (error) {
    console.error("Error al descargar el curso:", error);
    res.status(500).json({ message: "Error interno al descargar el curso." });
  }
});

export default router;

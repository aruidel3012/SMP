import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns";
import { PORT } from "./config.ts";
import { assignLearningPlanToSeedUser } from "./services/seed.ts";
import authRouter from "./routes/auth.ts";
import ticketsRouter from "./routes/tickets.ts";
import subscriptionsRouter from "./routes/subscriptions.ts";
import contractsRouter from "./routes/contracts.ts";
import accountRouter from "./routes/account.ts";
import paymentsRouter from "./routes/payments.ts";
import repairsRouter from "./routes/repairs.ts";
import doubtChatRouter from "./routes/doubtChat.ts";
import clientManagementRouter from "./routes/admin.ts";
import courseRouter from "./routes/course.ts";

dns.setDefaultResultOrder("ipv4first");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const mongoUri: string | undefined = process.env.MONGODB || process.env.MONGO_URI;
const mongoDbName: string = process.env.MONGO_DB_NAME || "smp";

if (!mongoUri) {
  console.error("Falta MONGO_URI");
  process.exit(1);
}

mongoose
  .connect(mongoUri, { dbName: mongoDbName })
  .then(async () => {
    console.log("MongoDB conectado");
    await assignLearningPlanToSeedUser();
  })
  .catch((err: Error) => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/account", accountRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/repairs", repairsRouter);
app.use("/api/doubt-chat", doubtChatRouter);
app.use("/api/client-management", clientManagementRouter);
app.use("/api/course", courseRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", ts: new Date() }));

app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(`Servidor SMP corriendo en http://0.0.0.0:${PORT}`),
);

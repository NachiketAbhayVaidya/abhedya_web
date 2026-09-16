import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";

import authRoutes from "./routes/authRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/guards", guardRoutes);
  app.use("/api/clients", clientRoutes);
  app.use("/api/sites", siteRoutes);
  app.use("/api/shifts", shiftRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // In production the client is built and this server also serves it, so the
  // whole app is a single Render web service (no separate static host needed).
  const clientDistPath = path.join(process.cwd(), "..", "client", "dist");
  if (process.env.NODE_ENV === "production" && fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

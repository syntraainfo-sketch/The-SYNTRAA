import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { env, assertProductionEnv } from "./config/env";
import { globalLimiter, webhookLimiter } from "./middleware/rateLimiter";
import { stripeWebhookHandler } from "./routes/v1/webhookStripe";
import { pkCallbacksRouter } from "./routes/v1/pkCallbacks";
import { v1Router } from "./routes/v1";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  assertProductionEnv();
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(globalLimiter);
  app.use(
    cors({
      origin: env.clientOrigin.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );

  app.post(
    "/api/v1/webhooks/stripe",
    webhookLimiter,
    express.raw({ type: "application/json", limit: "2mb" }),
    (req, res, next) => stripeWebhookHandler(req, res).catch(next)
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(mongoSanitize());
  app.use("/api/v1", pkCallbacksRouter);
  app.use("/api/v1", v1Router);
  app.get("/healthz", (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  return app;
}

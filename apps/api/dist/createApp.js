"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middleware/rateLimiter");
const webhookStripe_1 = require("./routes/v1/webhookStripe");
const pkCallbacks_1 = require("./routes/v1/pkCallbacks");
const v1_1 = require("./routes/v1");
const errorHandler_1 = require("./middleware/errorHandler");
function createApp() {
    (0, env_1.assertProductionEnv)();
    const app = (0, express_1.default)();
    app.disable("x-powered-by");
    app.set("trust proxy", 1);
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
    app.use(rateLimiter_1.globalLimiter);
    app.use((0, cors_1.default)({
        origin: env_1.env.clientOrigin.split(",").map((s) => s.trim()),
        credentials: true,
    }));
    app.post("/api/v1/webhooks/stripe", rateLimiter_1.webhookLimiter, express_1.default.raw({ type: "application/json", limit: "2mb" }), (req, res, next) => (0, webhookStripe_1.stripeWebhookHandler)(req, res).catch(next));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use((0, express_mongo_sanitize_1.default)());
    app.use("/api/v1", pkCallbacks_1.pkCallbacksRouter);
    app.use("/api/v1", v1_1.v1Router);
    app.get("/healthz", (_req, res) => res.json({ ok: true }));
    app.use(errorHandler_1.errorHandler);
    return app;
}

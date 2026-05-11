"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schemas_1 = require("../../validators/schemas");
const validateBody_1 = require("../../utils/validateBody");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const requireAuth_1 = require("../../middleware/requireAuth");
const User_1 = require("../../models/User");
const AppError_1 = require("../../utils/AppError");
const jwt_1 = require("../../utils/jwt");
const rateLimiter_1 = require("../../middleware/rateLimiter");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/auth/register", rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.registerSchema, req);
    const existing = await User_1.User.findOne({ email: body.email });
    if (existing)
        throw new AppError_1.AppError(409, "Email already registered");
    const passwordHash = await bcryptjs_1.default.hash(body.password, 12);
    const user = await User_1.User.create({
        email: body.email,
        passwordHash,
        name: body.name,
        role: "customer",
    });
    const payload = { sub: user._id.toString(), role: user.role };
    res.status(201).json({
        data: {
            user: { id: user._id, email: user.email, role: user.role },
            accessToken: (0, jwt_1.signAccessToken)(payload),
            refreshToken: (0, jwt_1.signRefreshToken)(payload),
        },
    });
}));
exports.authRouter.post("/auth/login", rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.loginSchema, req);
    const user = await User_1.User.findOne({ email: body.email });
    if (!user)
        throw new AppError_1.AppError(401, "Invalid credentials");
    const ok = await bcryptjs_1.default.compare(body.password, user.passwordHash);
    if (!ok)
        throw new AppError_1.AppError(401, "Invalid credentials");
    const payload = { sub: user._id.toString(), role: user.role };
    res.json({
        data: {
            user: { id: user._id, email: user.email, role: user.role },
            accessToken: (0, jwt_1.signAccessToken)(payload),
            refreshToken: (0, jwt_1.signRefreshToken)(payload),
        },
    });
}));
exports.authRouter.post("/auth/refresh", rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.body.refreshToken;
    if (!token)
        throw new AppError_1.AppError(400, "refreshToken required");
    const decoded = (0, jwt_1.verifyRefresh)(token);
    const user = await User_1.User.findById(decoded.sub);
    if (!user)
        throw new AppError_1.AppError(401, "Invalid refresh");
    const payload = { sub: user._id.toString(), role: user.role };
    res.json({
        data: {
            accessToken: (0, jwt_1.signAccessToken)(payload),
            refreshToken: (0, jwt_1.signRefreshToken)(payload),
        },
    });
}));
exports.authRouter.get("/auth/me", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const u = await User_1.User.findById(req.user.sub).select("email role name");
    if (!u)
        throw new AppError_1.AppError(404, "User not found");
    res.json({ data: u });
}));

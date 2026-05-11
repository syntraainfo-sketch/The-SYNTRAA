import { Router } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "../../validators/schemas";
import { validateBody } from "../../utils/validateBody";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/requireAuth";
import { User } from "../../models/User";
import { AppError } from "../../utils/AppError";
import { signAccessToken, signRefreshToken, verifyRefresh } from "../../utils/jwt";
import { authLimiter } from "../../middleware/rateLimiter";

export const authRouter = Router();

authRouter.post(
  "/auth/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = validateBody(registerSchema, req);
    const existing = await User.findOne({ email: body.email });
    if (existing) throw new AppError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      email: body.email,
      passwordHash,
      name: body.name,
      role: "customer",
    });
    const payload = { sub: user._id.toString(), role: user.role };
    res.status(201).json({
      data: {
        user: { id: user._id, email: user.email, role: user.role },
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  })
);

authRouter.post(
  "/auth/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = validateBody(loginSchema, req);
    const user = await User.findOne({ email: body.email });
    if (!user) throw new AppError(401, "Invalid credentials");
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new AppError(401, "Invalid credentials");
    const payload = { sub: user._id.toString(), role: user.role };
    res.json({
      data: {
        user: { id: user._id, email: user.email, role: user.role },
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  })
);

authRouter.post(
  "/auth/refresh",
  authLimiter,
  asyncHandler(async (req, res) => {
    const token = req.body.refreshToken as string | undefined;
    if (!token) throw new AppError(400, "refreshToken required");
    const decoded = verifyRefresh(token);
    const user = await User.findById(decoded.sub);
    if (!user) throw new AppError(401, "Invalid refresh");
    const payload = { sub: user._id.toString(), role: user.role };
    res.json({
      data: {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  })
);

authRouter.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const u = await User.findById(req.user!.sub).select("email role name");
    if (!u) throw new AppError(404, "User not found");
    res.json({ data: u });
  })
);

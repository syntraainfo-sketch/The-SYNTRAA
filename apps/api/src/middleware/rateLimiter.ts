import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 900,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
});

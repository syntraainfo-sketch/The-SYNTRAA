import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import type { JwtPayload } from "../utils/jwt";
import { verifyAccess } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    throw new AppError(401, "Unauthorized");
  }
  const token = h.slice("Bearer ".length);
  req.user = verifyAccess(token);
  next();
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) {
    try {
      req.user = verifyAccess(h.slice("Bearer ".length));
    } catch {
      /* ignore invalid token for optional flows */
    }
  }
  next();
}

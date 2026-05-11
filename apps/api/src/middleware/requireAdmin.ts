import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./requireAuth";
import { AppError } from "../utils/AppError";

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) throw new AppError(401, "Unauthorized");
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    throw new AppError(403, "Forbidden");
  }
  next();
}

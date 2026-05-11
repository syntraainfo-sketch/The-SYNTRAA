import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status =
    err instanceof AppError ? err.statusCode : err instanceof Error ? 400 : 500;
  const message =
    err instanceof Error ? err.message : "Unexpected error";
  const code = err instanceof AppError ? err.code : undefined;
  console.error("[api]", err);
  res.status(status).json({ error: { message, code } });
}

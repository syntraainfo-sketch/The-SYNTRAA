import type { Request } from "express";
import type { z } from "zod";
import { AppError } from "./AppError";

export function validateBody<T>(schema: z.ZodSchema<T>, req: Request): T {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      422,
      JSON.stringify(parsed.error.flatten().fieldErrors) || "Validation failed",
      "VALIDATION_ERROR"
    );
  }
  return parsed.data;
}

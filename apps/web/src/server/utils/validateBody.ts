import type { z } from "zod";
import { AppError } from "./AppError";

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(
      422,
      JSON.stringify(parsed.error.flatten().fieldErrors) || "Validation failed",
      "VALIDATION_ERROR"
    );
  }
  return parsed.data;
}

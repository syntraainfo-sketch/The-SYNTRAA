import type { NextRequest } from "next/server";
import { AppError } from "../utils/AppError";
import type { JwtPayload } from "../utils/jwt";
import { verifyAccess } from "../utils/jwt";

export function readBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length);
}

export function getOptionalUser(req: NextRequest): JwtPayload | undefined {
  const t = readBearerToken(req);
  if (!t) return undefined;
  try {
    return verifyAccess(t);
  } catch {
    return undefined;
  }
}

export function getRequiredUser(req: NextRequest): JwtPayload {
  const t = readBearerToken(req);
  if (!t) throw new AppError(401, "Unauthorized");
  return verifyAccess(t);
}

export function requireAdminRole(user: JwtPayload): void {
  if (user.role !== "admin" && user.role !== "superAdmin") {
    throw new AppError(403, "Forbidden");
  }
}

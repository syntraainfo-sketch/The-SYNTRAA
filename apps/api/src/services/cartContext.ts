import type { Request } from "express";

export interface CartIdentifiers {
  userId?: string;
  guestToken?: string;
}

export function resolveCartIds(
  req: Request,
  guestToken?: string
): CartIdentifiers {
  const userId = req.user?.sub;
  if (!userId && !guestToken) {
    return {};
  }
  return userId ? { userId } : { guestToken };
}

export function cartQueryFilter(ids: CartIdentifiers) {
  if (ids.userId) return { userId: ids.userId };
  if (ids.guestToken) return { guestToken: ids.guestToken };
  return null;
}

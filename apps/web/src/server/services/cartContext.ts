import mongoose from "mongoose";
import type { JwtPayload } from "../utils/jwt";

export interface CartIdentifiers {
  userId?: string;
  guestToken?: string;
}

export function resolveCartIds(
  user: JwtPayload | undefined,
  guestToken?: string
): CartIdentifiers {
  const userId = user?.sub;
  if (!userId && !guestToken) {
    return {};
  }
  return userId ? { userId } : { guestToken };
}

export function cartQueryFilter(ids: CartIdentifiers) {
  if (ids.userId && mongoose.isValidObjectId(ids.userId)) {
    return { userId: new mongoose.Types.ObjectId(ids.userId) };
  }
  if (ids.guestToken) return { guestToken: ids.guestToken };
  return null;
}

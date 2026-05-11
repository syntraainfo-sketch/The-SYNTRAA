import crypto from "crypto";

/** Placeholder hashing for PSP callbacks — swap for official JazzCash/Easypaisa algorithm per merchant docs */
export function hmacSha256Hex(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

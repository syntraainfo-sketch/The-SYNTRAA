import crypto from "crypto";

export function generateOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SYN-${t}-${r}`;
}

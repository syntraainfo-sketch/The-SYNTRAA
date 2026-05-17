/** Normalize productId from API JSON (string or nested object). */
export function normalizeCartProductId(productId: unknown): string {
  if (typeof productId === "string") return productId;
  if (productId && typeof productId === "object") {
    const o = productId as { _id?: unknown; toString?: () => string };
    if (o._id != null) return String(o._id);
    if (typeof o.toString === "function") return o.toString();
  }
  return String(productId ?? "");
}

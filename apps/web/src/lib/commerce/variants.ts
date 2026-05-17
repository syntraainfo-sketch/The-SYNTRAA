import type { ProductVariant } from "@syntraa/types";

/** Display label for size chips (e.g. "100 ml" → "100ml", "100 GRM" → "100grm"). */
export function formatMlLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/\s*ml\b/gi, "ml")
    .replace(/\s*grm\b/gi, "grm")
    .replace(/\s*g\b/gi, "g")
    .replace(/\s+/g, "");
}

function sizeFromSku(sku: string): string | null {
  const ml = sku.match(/(\d+(?:\.\d+)?)[\s_-]*ml\b/i);
  if (ml) return `${ml[1]}ml`;
  const grm = sku.match(/(\d+(?:\.\d+)?)[\s_-]*grm\b/i);
  if (grm) return `${grm[1]}grm`;
  return null;
}

function normalizeOne(v: ProductVariant): ProductVariant | null {
  const sku = String(v.sku ?? "").trim();
  if (!sku) return null;

  const sizeRaw = String(v.size ?? "").trim();
  const labelRaw = String(v.label ?? "").trim();
  const size = sizeRaw || labelRaw || sizeFromSku(sku) || "";
  const label = labelRaw || sizeRaw || size;

  return {
    ...v,
    sku,
    size: size || undefined,
    label: label || undefined,
    priceUSD: Number(v.priceUSD) || 0,
    inventory: Number.isFinite(Number(v.inventory)) ? Number(v.inventory) : 0,
  };
}

export function sortVariantsByMl(a: ProductVariant, b: ProductVariant): number {
  const ml = (v: ProductVariant) => {
    const src = String(v.size ?? v.label ?? v.sku ?? "");
    const m = src.match(/(\d+(?:\.\d+)?)\s*ml/i);
    return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
  };
  return ml(a) - ml(b);
}

/** Ensures storefront always gets a clean variant list with ML labels. */
export function normalizeProductVariants(
  variants: ProductVariant[] | null | undefined
): ProductVariant[] {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v) => normalizeOne(v))
    .filter((v): v is ProductVariant => v != null)
    .sort(sortVariantsByMl);
}

export function variantDisplayLabel(v: ProductVariant): string {
  const size = formatMlLabel(String(v.size ?? ""));
  if (size) return size;
  const label = formatMlLabel(String(v.label ?? ""));
  if (label) return label;
  const fromSku = sizeFromSku(String(v.sku ?? ""));
  if (fromSku) return fromSku;
  return String(v.sku ?? "Standard");
}

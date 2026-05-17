import type { HydratedDocument } from "mongoose";
import type { ProductDoc } from "./models/Product";
import type { CategoryDoc } from "./models/Category";
import { normalizeProductVariants } from "@/lib/commerce/variants";

export function productJSON(p: HydratedDocument<ProductDoc>) {
  return {
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    descriptionShort: p.descriptionShort,
    richDescription: p.richDescription,
    ingredients: p.ingredients,
    howToUse: p.howToUse,
    benefits: p.benefits,
    sustainability: p.sustainability,
    highlights: p.highlights ?? [],
    gallery: p.gallery ?? [],
    variants: normalizeProductVariants(
      (p.variants ?? []).map((v) => ({
        sku: String(v.sku ?? ""),
        label: v.label != null ? String(v.label) : undefined,
        size: v.size != null ? String(v.size) : undefined,
        color: v.color != null ? String(v.color) : undefined,
        priceUSD: Number(v.priceUSD) || 0,
        compareAtUSD:
          v.compareAtUSD != null ? Number(v.compareAtUSD) : undefined,
        inventory: Number(v.inventory) || 0,
      }))
    ),
    categories: (p.categories ?? []).map((c) =>
      typeof c === "object" && c && "_id" in c ? c._id?.toString() : String(c)
    ),
    featured: p.featured,
    seo: p.seo ?? {},
    aggregateRating: p.aggregateRating,
    reviewsCount: p.reviewsCount,
    updatedAt: p.updatedAt,
    createdAt: p.createdAt,
  };
}

export function categoryJSON(c: HydratedDocument<CategoryDoc>) {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    parentId: c.parentId?.toString() ?? null,
    order: c.order,
    heroImagePublicId: c.heroImagePublicId,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
  };
}

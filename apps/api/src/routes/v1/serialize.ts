import type { HydratedDocument } from "mongoose";
import type { ProductDoc } from "../../models/Product";
import type { CategoryDoc } from "../../models/Category";

export function productJSON(p: HydratedDocument<ProductDoc>) {
  return {
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    descriptionShort: p.descriptionShort,
    richDescription: p.richDescription,
    gallery: p.gallery ?? [],
    variants: p.variants ?? [],
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

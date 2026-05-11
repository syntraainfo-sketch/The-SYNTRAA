import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { CategoryDTO, ProductDTO } from "@syntraa/types";
import { ProductCard, type UiProductCard } from "@/components/commerce/ProductCard";

function mapProduct(p: ProductDTO): UiProductCard {
  const prices = p.variants?.map((v) => v.priceUSD).filter(Boolean) ?? [];
  const from = prices.length ? Math.min(...prices) : undefined;
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.descriptionShort,
    imagePublicId: p.gallery?.[0]?.publicId,
    fromUSD: from,
  };
}

export const revalidate = 120;

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let payload: { category: CategoryDTO; products: ProductDTO[] };
  try {
    const res = await apiGet<
      ApiEnvelope<{ category: CategoryDTO; products: ProductDTO[] }>
    >(`/categories/${slug}`, { next: { revalidate: 120 } });
    payload = res.data;
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-14 md:px-10">
      <header className="mb-16 max-w-2xl">
        <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
          Category
        </p>
        <h1 className="font-display mt-4 text-[2.8rem] leading-tight">
          {payload.category.name}
        </h1>
      </header>
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {payload.products.map((p) => (
          <ProductCard key={p.slug} product={mapProduct(p)} />
        ))}
      </section>
    </main>
  );
}

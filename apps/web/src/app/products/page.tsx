import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { ProductDTO } from "@syntraa/types";
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

export const revalidate = 60;

export default async function ProductsPage() {
  let products: ProductDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<ProductDTO[]>>("/products?limit=48", {
      next: { revalidate: 60, tags: ["catalog"] },
    });
    products = Array.isArray(res.data) ? res.data : [];
  } catch {
    products = [];
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10">
      <header className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
            Catalogue
          </p>
          <h1 className="font-display mt-4 text-[2.85rem] leading-tight">
            Curated artefacts.
          </h1>
        </div>
        <Link href="/categories" className="text-[0.7rem] uppercase tracking-[0.28em] text-muted hover:text-text">
          Taxonomy →
        </Link>
      </header>
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={mapProduct(p)} />
        ))}
      </section>
    </main>
  );
}

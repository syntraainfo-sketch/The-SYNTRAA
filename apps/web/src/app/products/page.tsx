import type { ReactNode } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { CategoryDTO, ProductDTO } from "@syntraa/types";
import { CatalogProductCard } from "@/components/commerce/CatalogProductCard";

export const dynamic = "force-dynamic";

type Search = { categorySlug?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { categorySlug } = await searchParams;
  const qs = new URLSearchParams({ limit: "48" });
  if (categorySlug) qs.set("categorySlug", categorySlug);

  let products: ProductDTO[] = [];
  let categories: CategoryDTO[] = [];
  try {
    const [pRes, cRes] = await Promise.all([
      apiGet<ApiEnvelope<ProductDTO[]>>(`/products?${qs.toString()}`),
      apiGet<ApiEnvelope<CategoryDTO[]>>("/categories"),
    ]);
    products = Array.isArray(pRes.data) ? pRes.data : [];
    categories = Array.isArray(cRes.data) ? cRes.data : [];
  } catch {
    products = [];
    categories = [];
  }

  const catMap = new Map(categories.map((c) => [c.id ?? c._id ?? "", c.name]));
  const activeSlug = categorySlug ?? "";

  function categoryLabel(p: ProductDTO): string | undefined {
    const id = p.categories?.[0];
    if (!id) return undefined;
    return catMap.get(id);
  }

  return (
    <main className="min-h-screen bg-white pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-[2.1rem] leading-[1.15] tracking-tight text-[#111] md:text-[2.75rem]">
            Love Your Skin With Our Product
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-[0.95rem] leading-relaxed text-[#555]">
            Thoughtfully composed formulas and rituals — curated for clarity, comfort, and everyday
            radiance.
          </p>
        </header>

        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          <FilterPill href="/products" active={!activeSlug}>
            All
          </FilterPill>
          {categories.map((c) => {
            const slug = c.slug;
            const active = activeSlug === slug;
            return (
              <FilterPill key={slug} href={`/products?categorySlug=${encodeURIComponent(slug)}`} active={active}>
                {c.name}
              </FilterPill>
            );
          })}
        </div>

        <section className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const prices = p.variants?.map((v) => v.priceUSD).filter(Boolean) ?? [];
            const from = prices.length ? Math.min(...prices) : undefined;
            return (
              <CatalogProductCard
                key={p.slug}
                slug={p.slug}
                title={p.title}
                imagePublicId={p.gallery?.[0]?.publicId}
                fromUSD={from}
                categoryLabel={categoryLabel(p)}
                variantSizes={p.variants?.map((v) => v.size || v.label || "")}
              />
            );
          })}
        </section>

        {products.length === 0 ? (
          <p className="mt-16 text-center font-sans text-muted">No products in this category yet.</p>
        ) : null}

        <p className="mt-16 text-center">
          <Link href="/categories" className="text-[0.72rem] uppercase tracking-[0.2em] text-[#666] underline-offset-4 hover:text-black hover:underline">
            Browse all categories
          </Link>
        </p>
      </div>
    </main>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-[#2d2d2d] px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-white"
          : "rounded-full border border-[#ccc] bg-white px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-[#333] transition hover:border-[#999]"
      }
    >
      {children}
    </Link>
  );
}

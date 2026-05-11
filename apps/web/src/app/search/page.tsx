"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ProductDTO } from "@syntraa/types";
import { API_PREFIX } from "@/lib/env";
import type { ApiEnvelope } from "@/lib/types";
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

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const trimmed = q.trim();
  const [items, setItems] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trimmed) return;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_PREFIX}/search?q=${encodeURIComponent(trimmed)}`
        );
        const body = (await res.json()) as ApiEnvelope<ProductDTO[]>;
        setItems(Array.isArray(body.data) ? body.data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [trimmed]);

  const displayed = trimmed === "" ? [] : items;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-16 md:px-10">
      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">Search</p>
      <h1 className="font-display mt-4 text-3xl">Results for “{q}”</h1>
      {loading && trimmed !== "" && (
        <p className="mt-8 text-sm text-muted">Scanning catalogue…</p>
      )}
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayed.map((p) => (
          <ProductCard key={p.slug} product={mapProduct(p)} />
        ))}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-5 pb-28 pt-16 text-sm text-muted md:px-10">
          Preparing search…
        </main>
      }
    >
      <SearchInner />
    </Suspense>
  );
}

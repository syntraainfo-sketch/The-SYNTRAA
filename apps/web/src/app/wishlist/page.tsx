"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductDTO } from "@syntraa/types";
import { API_PREFIX } from "@/lib/env";
import type { ApiEnvelope } from "@/lib/types";
import { useGuestStore } from "@/stores/guest";
import { apiFetch, apiGetClient } from "@/lib/client-http";
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

export default function WishlistPage() {
  const guestToken = useGuestStore((s) => s.guestToken);
  const setGuestToken = useGuestStore((s) => s.setGuestToken);
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      const qs = guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : "";
      const res = await apiGetClient(`/wishlist${qs}`);
      const body = (await res.json()) as {
        data?: { productIds?: string[] };
      };
      setProductIds(body.data?.productIds ?? []);
    };
    void run();
  }, [guestToken]);

  const [catalog, setCatalog] = useState<ProductDTO[]>([]);
  useEffect(() => {
    const run = async () => {
      const res = await fetch(`${API_PREFIX}/products?limit=120`);
      const body = (await res.json()) as ApiEnvelope<ProductDTO[]>;
      setCatalog(Array.isArray(body.data) ? body.data : []);
    };
    void run();
  }, []);

  const saved = useMemo(() => {
    const set = new Set(productIds);
    return catalog.filter((p) => set.has(p.id ?? p._id ?? ""));
  }, [catalog, productIds]);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-16 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
            Wishlist
          </p>
          <h1 className="font-display mt-4 text-4xl">Saved impressions</h1>
        </div>
        <p className="max-w-md text-sm text-muted">
          Guest tokens persist locally. Sign in (API) to merge lists — route{" "}
          <code className="text-xs text-text/80">/wishlist/merge</code> is ready on
          the backend.
        </p>
      </div>

      <section className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {saved.map((p) => (
          <div key={p.slug} className="space-y-4">
            <ProductCard product={mapProduct(p)} />
            <button
              type="button"
              className="text-xs uppercase tracking-[0.24em] text-muted hover:text-text"
              onClick={async () => {
                const res = await apiFetch("/wishlist/toggle", {
                  method: "POST",
                  json: {
                    productId: p.id ?? p._id,
                    guestToken,
                  },
                });
                const payload = (await res.json()) as {
                  data?: { guestToken?: string };
                };
                if (payload.data?.guestToken)
                  setGuestToken(payload.data.guestToken);
                setProductIds((prev) =>
                  prev.filter((id) => id !== (p.id ?? p._id ?? ""))
                );
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

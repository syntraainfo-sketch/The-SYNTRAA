"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGuestStore } from "@/stores/guest";
import { apiFetch, apiGetClient } from "@/lib/client-http";

interface CartItem {
  productId: string;
  sku: string;
  quantity: number;
}

export default function CartPage() {
  const guestToken = useGuestStore((s) => s.guestToken);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const qs = guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : "";
        const res = await apiGetClient(`/cart${qs}`);
        const body = (await res.json()) as { data?: { items?: CartItem[] } };
        setItems(body.data?.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [guestToken]);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-28 pt-16 md:px-10">
      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">Cart</p>
      <h1 className="font-display mt-4 text-4xl">Your selection</h1>
      {loading && <p className="mt-10 text-sm text-muted">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="mt-10 text-muted">
          The cart is empty —{" "}
          <Link href="/products" className="text-text underline">
            continue exploring
          </Link>
          .
        </p>
      )}
      <ul className="mt-10 space-y-4">
        {items.map((i) => (
          <li
            key={`${i.productId}-${i.sku}`}
            className="flex items-center justify-between rounded-2xl border border-hairline bg-surface/40 px-5 py-4 text-sm"
          >
            <div>
              <p className="font-medium text-text">{i.sku}</p>
              <p className="text-xs text-muted">{i.productId}</p>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">
              ×{i.quantity}
            </p>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/checkout"
            className="rounded-full border border-hairline bg-linear-to-r from-white/14 to-transparent px-8 py-3 text-[0.75rem] uppercase tracking-[0.28em]"
          >
            Continue to treasury
          </Link>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.26em] text-muted hover:text-text"
            onClick={async () => {
              for (const row of items) {
                await apiFetch("/cart/items", {
                  method: "DELETE",
                  json: {
                    guestToken,
                    productId: row.productId,
                    sku: row.sku,
                  },
                });
              }
              setItems([]);
            }}
          >
            Clear staging
          </button>
        </div>
      )}
    </main>
  );
}

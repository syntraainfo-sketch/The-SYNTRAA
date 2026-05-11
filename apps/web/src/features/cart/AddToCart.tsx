"use client";

import { useState } from "react";
import type { ProductVariant } from "@syntraa/types";
import { apiFetch } from "@/lib/client-http";
import { useGuestStore } from "@/stores/guest";

interface AddToCartProps {
  title: string;
  slug: string;
  variants: ProductVariant[];
  /** Mongo-like id returned from API `/products/:slug` (`data.id`) */
  productMongoId: string;
}

export function AddToCart({
  title,
  slug,
  variants,
  productMongoId,
}: AddToCartProps) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const guestToken = useGuestStore((s) => s.guestToken);
  const setGuest = useGuestStore((s) => s.setGuestToken);

  const [sku, setSku] = useState(variants[0]?.sku ?? "");

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const variant = variants.find((v) => v.sku === sku) ?? variants[0];
      if (!variant) throw new Error("No variant");
      const res = await apiFetch("/cart/items", {
        method: "POST",
        json: {
          productId: productMongoId,
          sku: variant.sku,
          quantity: qty,
          ...(guestToken ? { guestToken } : {}),
        },
      });
      const body = (await res.json()) as {
        meta?: { guestToken?: string };
      };
      if (!res.ok) throw new Error("Could not update cart");
      if (body.meta?.guestToken) setGuest(body.meta.guestToken);
      setMsg(`Added ${qty} × ${title} (${variant.sku})`);
    } catch (e) {
      setMsg((e as Error).message ?? "Unable to cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
          Variant / SKU
          <select
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-hairline bg-black/40 px-4 py-3 text-sm text-text"
          >
            {variants.map((v) => (
              <option key={v.sku} value={v.sku}>
                {v.label ?? v.sku} · ${v.priceUSD} · stock {v.inventory}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
          Quantity
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-hairline bg-black/40 px-4 py-3 text-sm text-text"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="w-full rounded-full border border-hairline bg-linear-to-r from-zinc-100/12 to-white/4 px-5 py-3 text-[0.72rem] uppercase tracking-[0.28em] text-text transition hover:border-white/30 disabled:opacity-40"
          >
            {busy ? "Composing…" : "Add to cart"}
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">
        Object ref · {slug}
      </p>
    </div>
  );
}

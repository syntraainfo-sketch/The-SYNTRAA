"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@syntraa/types";
import { apiFetch } from "@/lib/client-http";
import {
  normalizeProductVariants,
  variantDisplayLabel,
} from "@/lib/commerce/variants";
import { cn } from "@/lib/utils";
import { useGuestStore } from "@/stores/guest";
import { Minus, Plus } from "lucide-react";

interface AddToCartProps {
  title: string;
  slug: string;
  variants: ProductVariant[];
  productMongoId: string;
}

function ProductSizeButtons({
  variants,
  selectedSku,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedSku: string;
  onSelect: (sku: string) => void;
}) {
  return (
    <div
      className="border-t border-black/10 pt-6"
      data-ui="product-size-buttons"
    >
      <p className="mb-3 font-sans text-sm text-[#737373]">Size</p>
      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const active = v.sku === selectedSku;
          const outOfStock = (v.inventory ?? 0) <= 0;
          return (
            <button
              key={v.sku}
              type="button"
              onClick={() => onSelect(v.sku)}
              className={cn(
                "inline-flex min-h-10 min-w-[4.5rem] flex-col items-center justify-center rounded-lg px-4 py-2 font-sans text-sm transition-colors",
                active
                  ? "bg-[#2d2d2d] text-white"
                  : "bg-[#f3f3f3] text-[#a3a3a3] hover:bg-[#ebebeb] hover:text-[#666]",
                outOfStock && !active && "opacity-70"
              )}
            >
              <span>{variantDisplayLabel(v)}</span>
              {outOfStock ? (
                <span
                  className={cn(
                    "mt-0.5 text-[0.6rem] uppercase tracking-wide",
                    active ? "text-white/80" : "text-[#b07070]"
                  )}
                >
                  Sold out
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddToCart({
  title,
  slug,
  variants,
  productMongoId,
}: AddToCartProps) {
  const sortedVariants = useMemo(
    () => normalizeProductVariants(variants),
    [variants]
  );

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const guestToken = useGuestStore((s) => s.guestToken);
  const setGuest = useGuestStore((s) => s.setGuestToken);

  const [sku, setSku] = useState(() => sortedVariants[0]?.sku ?? "");

  const activeSku = useMemo(() => {
    if (!sortedVariants.length) return "";
    return sortedVariants.some((v) => v.sku === sku) ? sku : sortedVariants[0].sku;
  }, [sortedVariants, sku]);

  const selected =
    sortedVariants.find((v) => v.sku === activeSku) ?? sortedVariants[0];
  const price = selected?.priceUSD ?? 0;
  const compareAt = selected?.compareAtUSD;
  const outOfStock = !selected || (selected.inventory ?? 0) <= 0;
  const canAdd = Boolean(productMongoId) && !outOfStock;

  async function submit() {
    if (!productMongoId) {
      setMsg("Product ID missing — page refresh karein.");
      return;
    }
    if (outOfStock) {
      setMsg("Yeh size abhi stock mein nahi. Admin → Products se Stock update karein.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const variant =
        sortedVariants.find((v) => v.sku === activeSku) ?? sortedVariants[0];
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
        error?: { message?: string };
      };
      if (!res.ok) {
        const apiMsg = body.error?.message;
        throw new Error(apiMsg || "Could not update cart");
      }
      if (body.meta?.guestToken) setGuest(body.meta.guestToken);
      setMsg(`Added ${qty} × ${title}`);
      window.dispatchEvent(new Event("syntraa:cart"));
    } catch (e) {
      setMsg((e as Error).message ?? "Unable to cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6" data-ui="product-buy-box">
      <p className="font-display text-2xl font-medium text-[#111]">
        ${price.toFixed(2)}
        {compareAt != null && compareAt > price ? (
          <span className="ml-3 font-sans text-sm font-normal text-[#999] line-through">
            ${compareAt.toFixed(2)}
          </span>
        ) : null}
      </p>

      {sortedVariants.length > 0 ? (
        <ProductSizeButtons
          variants={sortedVariants}
          selectedSku={activeSku}
          onSelect={setSku}
        />
      ) : (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 font-sans text-sm text-amber-900">
          Is product ke liye abhi size set nahi — Admin → Products se variants add karein.
        </p>
      )}

      <div className="space-y-4 border-t border-black/10 pt-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-[#666]">
            Quantity
          </span>
          <div className="inline-flex items-center rounded-full border border-black/15 bg-[#faf8f5] p-1">
            <button
              type="button"
              aria-label="Decrease"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#111] transition hover:bg-white"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center font-sans text-sm font-medium text-[#111]">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#111] transition hover:bg-white"
              onClick={() => setQty((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {outOfStock ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800">
            Is size ka stock 0 hai — khareedari ke liye Admin → Products mein har variant ka{" "}
            <strong>Stock</strong> 1 ya zyada set karein, phir Save.
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={busy || !canAdd}
          className="w-full rounded-full bg-[#c4a882] py-4 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] shadow-sm transition hover:bg-[#b89b72] disabled:opacity-50 md:max-w-md"
        >
          {busy ? "Adding…" : outOfStock ? "Out of stock" : "Add to basket"}
        </button>

        {msg ? (
          <p
            className={cn(
              "font-sans text-sm",
              msg.startsWith("Added") ? "text-[#555]" : "text-red-700"
            )}
          >
            {msg}
          </p>
        ) : null}
        <p className="font-mono text-[0.65rem] text-[#999]">Ref · {slug}</p>
      </div>
    </div>
  );
}

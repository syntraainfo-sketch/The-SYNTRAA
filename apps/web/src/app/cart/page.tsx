"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGuestStore } from "@/stores/guest";
import { apiFetch, apiGetClient } from "@/lib/client-http";
import { normalizeCartProductId } from "@/lib/cart/ids";
import { cld } from "@/lib/cloudinary";

interface CartItem {
  productId: string;
  sku: string;
  quantity: number;
  title?: string;
  slug?: string;
  imagePublicId?: string;
  variantLabel?: string;
  priceUSD?: number;
}

function notifyCartChanged() {
  window.dispatchEvent(new Event("syntraa:cart"));
}

export default function CartPage() {
  const guestToken = useGuestStore((s) => s.guestToken);
  const hasHydrated = useGuestStore((s) => s.hasHydrated);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : "";
      const res = await apiGetClient(`/cart${qs}`);
      const body = (await res.json()) as { data?: { items?: CartItem[] } };
      if (!res.ok) {
        setItems([]);
        return;
      }
      const rows = body.data?.items ?? [];
      setItems(
        rows.map((row) => ({
          ...row,
          productId: normalizeCartProductId(row.productId),
        }))
      );
    } catch {
      setItems([]);
      setError("Cart load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }, [guestToken]);

  useEffect(() => {
    if (!hasHydrated) return;
    queueMicrotask(() => void loadCart());
  }, [hasHydrated, loadCart]);

  async function removeItem(row: CartItem) {
    const productId = normalizeCartProductId(row.productId);
    const key = `${productId}-${row.sku}`;
    setRemovingKey(key);
    setError(null);
    try {
      const res = await apiFetch("/cart/items", {
        method: "DELETE",
        json: {
          productId,
          sku: row.sku,
          ...(guestToken ? { guestToken } : {}),
        },
      });
      const body = (await res.json()) as {
        data?: { items?: CartItem[] };
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(body.error?.message || "Remove nahi hua");
      }
      const next = (body.data?.items ?? []).map((item) => ({
        ...item,
        productId: normalizeCartProductId(item.productId),
      }));
      setItems(next);
      notifyCartChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRemovingKey(null);
    }
  }

  async function clearCart() {
    setClearing(true);
    setError(null);
    try {
      const res = await apiFetch("/cart/items", {
        method: "DELETE",
        json: {
          clearAll: true as const,
          ...(guestToken ? { guestToken } : {}),
        },
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(body.error?.message || "Cart clear nahi hua");
      }
      setItems([]);
      notifyCartChanged();
    } catch (e) {
      setError((e as Error).message);
      await loadCart();
    } finally {
      setClearing(false);
    }
  }

  const subtotal = items.reduce(
    (sum, row) => sum + (row.priceUSD ?? 0) * row.quantity,
    0
  );

  return (
    <main className="mx-auto max-w-4xl px-5 pb-28 pt-16 md:px-10">
      <p className="font-sans text-sm uppercase tracking-[0.12em] text-[#888]">Cart</p>
      <h1 className="font-display mt-3 text-4xl text-[#111]">Your basket</h1>

      {loading && <p className="mt-10 text-sm text-[#666]">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="mt-10 text-[#666]">
          Your cart is empty —{" "}
          <Link href="/products" className="text-[#111] underline">
            continue shopping
          </Link>
          .
        </p>
      )}

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-10 space-y-4">
        {items.map((i) => {
          const key = `${i.productId}-${i.sku}`;
          const busy = removingKey === key;
          return (
            <li
              key={key}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eee] bg-white px-5 py-4 text-sm shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5EFE6]">
                  <Image
                    src={i.imagePublicId ? cld(i.imagePublicId, 180) : "/globe.svg"}
                    alt={i.title ?? i.sku}
                    fill
                    className="object-contain"
                    sizes="80px"
                    unoptimized={i.imagePublicId ? cld(i.imagePublicId).startsWith("http") : false}
                  />
                </div>
                <div className="min-w-0">
                  {i.slug ? (
                    <Link
                      href={`/products/${i.slug}`}
                      className="font-medium text-[#111] hover:underline"
                    >
                      {i.title ?? i.sku}
                    </Link>
                  ) : (
                    <p className="font-medium text-[#111]">{i.title ?? i.sku}</p>
                  )}
                  <p className="mt-1 text-xs text-[#666]">
                    {i.variantLabel ?? i.sku}
                    {typeof i.priceUSD === "number" ? ` · $${i.priceUSD.toFixed(2)}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#888]">×{i.quantity}</p>
                <button
                  type="button"
                  disabled={busy || clearing}
                  onClick={() => void removeItem(i)}
                  className="font-sans text-xs uppercase tracking-[0.18em] text-[#888] underline-offset-2 hover:text-[#111] hover:underline disabled:opacity-50"
                >
                  {busy ? "Removing…" : "Remove"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {items.length > 0 && (
        <>
          <p className="mt-8 text-right font-sans text-sm text-[#333]">
            Subtotal: <strong>${subtotal.toFixed(2)}</strong>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/checkout"
              className="rounded-full bg-[#c4a882] px-8 py-3 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] shadow-sm hover:bg-[#b89b72]"
            >
              Checkout
            </Link>
            <button
              type="button"
              disabled={clearing || Boolean(removingKey)}
              onClick={() => void clearCart()}
              className="rounded-full border border-[#ddd] px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-[#666] hover:border-[#999] hover:text-[#111] disabled:opacity-50"
            >
              {clearing ? "Clearing…" : "Clear basket"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

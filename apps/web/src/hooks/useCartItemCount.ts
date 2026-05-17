"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { API_PREFIX } from "@/lib/env";
import { getStoredAccessToken } from "@/lib/auth";
import { useGuestStore } from "@/stores/guest";

type CartBody = {
  data?: { items?: Array<{ quantity?: number }> };
};

export function useCartItemCount(): number {
  const guestToken = useGuestStore((s) => s.guestToken);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const q = guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : "";
    const headers = new Headers();
    const token = getStoredAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_PREFIX}/cart${q}`, { headers, cache: "no-store" });
    const apply = (n: number) => startTransition(() => setCount(n));
    if (!res.ok) {
      apply(0);
      return;
    }
    const body = (await res.json()) as CartBody;
    const items = body.data?.items ?? [];
    const n = items.reduce((acc, line) => acc + (Number(line.quantity) || 0), 0);
    apply(n);
  }, [guestToken]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  useEffect(() => {
    const t = window.setInterval(() => void load(), 20000);
    const onFocus = () => void load();
    const onCart = () => void load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("syntraa:cart", onCart);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("syntraa:cart", onCart);
    };
  }, [load]);

  return count;
}

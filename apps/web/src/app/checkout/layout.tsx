import type { ReactNode } from "react";

/** Checkout relies on search params and client providers; skip static prerender at build. */
export const dynamic = "force-dynamic";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}

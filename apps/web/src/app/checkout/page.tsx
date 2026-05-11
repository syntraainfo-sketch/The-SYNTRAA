import Link from "next/link";
import { CheckoutActions } from "@/features/checkout/CheckoutActions";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 pb-28 pt-16 md:px-10">
      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
        Treasury
      </p>
      <h1 className="font-display mt-4 text-4xl">Finalise your composition</h1>
      <p className="mt-6 text-sm text-muted">
        Choose a payment rail. Stripe handles international cards; JazzCash & Easypaisa
        honour local liquidity with PKR conversion on the server.
      </p>
      <div className="mt-12 glass-panel rounded-4xl p-10">
        <CheckoutActions />
      </div>
      <Link href="/cart" className="mt-10 inline-block text-xs uppercase tracking-[0.28em] text-muted hover:text-text">
        ← Return to cart
      </Link>
    </main>
  );
}

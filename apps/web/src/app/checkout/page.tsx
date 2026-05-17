import Link from "next/link";
import type { ApiEnvelope } from "@/lib/types";
import type { CheckoutPaymentOptions } from "@syntraa/types";
import { apiGet } from "@/lib/api";
import { DEFAULT_CHECKOUT_OPTIONS } from "@/lib/checkout/defaults";
import { CheckoutActions } from "@/features/checkout/CheckoutActions";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

async function loadCheckoutOptions(): Promise<CheckoutPaymentOptions> {
  try {
    const res = await apiGet<ApiEnvelope<CheckoutPaymentOptions>>("/checkout/options");
    return res.data ?? DEFAULT_CHECKOUT_OPTIONS;
  } catch {
    return DEFAULT_CHECKOUT_OPTIONS;
  }
}

export default async function CheckoutPage() {
  const initialOptions = await loadCheckoutOptions();

  return (
    <main className="min-h-screen bg-white pb-28 pt-12 md:pt-16">
      <div className="mx-auto max-w-3xl px-5 md:px-10">
        <p className="font-sans text-sm uppercase tracking-[0.12em] text-[#888]">Checkout</p>
        <h1 className="font-display mt-3 text-4xl text-[#111]">Complete your order</h1>
        <p className="mt-4 text-sm text-[#666]">
          Payment method choose karein, delivery details bharein, aur order place karein.
        </p>

        <div className="mt-10 rounded-3xl border border-[#eee] bg-white p-6 shadow-sm md:p-8">
          <CheckoutActions initialOptions={initialOptions} />
        </div>

        <Link
          href="/cart"
          className="mt-8 inline-block font-sans text-sm text-[#888] hover:text-[#111]"
        >
          ← Back to cart
        </Link>
      </div>
    </main>
  );
}

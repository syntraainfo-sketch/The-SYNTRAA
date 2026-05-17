import type { CheckoutPaymentOptions } from "@syntraa/types";
import type { ApiEnvelope } from "@/lib/types";
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
    <main className="min-h-screen bg-white pb-16 pt-6 md:pt-10">
      <div className="mx-auto max-w-[36rem] px-5">
        <CheckoutActions initialOptions={initialOptions} />
      </div>
    </main>
  );
}

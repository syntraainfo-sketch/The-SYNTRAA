"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Body() {
  const sp = useSearchParams();
  const order = sp.get("order");
  const method = sp.get("method");
  const sessionId = sp.get("session_id");

  const reference =
    order ?? (sessionId ? `Stripe session ${sessionId}` : null);

  let detail =
    "Your order has been received. Our team will contact you if anything else is needed.";

  if (method === "bank_transfer") {
    detail =
      "Order placed. Complete your bank transfer and share your payment screenshot with our team.";
  } else if (method === "cod") {
    detail = "Order confirmed. Thank you for shopping with THE SYNTRAA.";
  } else if (sessionId) {
    detail = "Payment received. Thank you for shopping with THE SYNTRAA.";
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-28 pt-20 text-center md:px-10">
      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">Confirmed</p>
      <h1 className="font-display mt-6 text-4xl">Thank you.</h1>
      {reference ? (
        <p className="mt-4 font-sans text-lg text-[#111]">Reference · {reference}</p>
      ) : null}
      <p className="mt-6 text-muted">{detail}</p>
    </main>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-5 pb-28 pt-20 text-center text-sm text-muted md:px-10">
          Resolving session…
        </main>
      }
    >
      <Body />
    </Suspense>
  );
}

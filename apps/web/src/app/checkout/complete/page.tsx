"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Body() {
  const sp = useSearchParams();
  const order =
    sp.get("order") ??
    (sp.get("session_id") ? `Stripe session ${sp.get("session_id")}` : null);
  return (
    <main className="mx-auto max-w-3xl px-5 pb-28 pt-20 text-center md:px-10">
      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
        Confirmed
      </p>
      <h1 className="font-display mt-6 text-4xl">Thank you.</h1>
      <p className="mt-6 text-muted">
        {order
          ? `Reference · ${order}`
          : "Your payment has been noted. Receipt follows by email."}
      </p>
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

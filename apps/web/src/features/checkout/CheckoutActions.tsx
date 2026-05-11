"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client-http";
import { useGuestStore } from "@/stores/guest";

type Provider = "stripe" | "jazzcash" | "easypaisa";

export function CheckoutActions() {
  const guestToken = useGuestStore((s) => s.guestToken);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<Provider | null>(null);

  async function startStripe() {
    setBusy("stripe");
    setStatus(null);
    try {
      const res = await apiFetch("/checkout/stripe-session", {
        method: "POST",
        json: guestToken ? { guestToken } : {},
      });
      const body = (await res.json()) as { data?: { checkoutUrl?: string } };
      if (!res.ok || !body.data?.checkoutUrl) throw new Error("Stripe unavailable");
      window.location.href = body.data.checkoutUrl;
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function postGateway(postUrl: string, fields: Record<string, string>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = postUrl;
    for (const [k, v] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }

  async function startPk(provider: "jazzcash" | "easypaisa") {
    setBusy(provider);
    setStatus(null);
    try {
      const res = await apiFetch(`/payments/${provider}/initiate`, {
        method: "POST",
        json: guestToken ? { guestToken } : {},
      });
      const body = (await res.json()) as {
        data?: { postUrl?: string; fields?: Record<string, string> };
      };
      if (!res.ok || !body.data?.postUrl || !body.data.fields) {
        throw new Error("Payment rail unavailable");
      }
      postGateway(body.data.postUrl, body.data.fields);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={startStripe}
          className="rounded-2xl border border-hairline bg-linear-to-b from-white/18 to-white/5 px-4 py-4 text-[0.7rem] uppercase tracking-[0.28em] text-text disabled:opacity-40"
        >
          {busy === "stripe" ? "Opening…" : "Pay with Stripe"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => startPk("jazzcash")}
          className="rounded-2xl border border-hairline bg-surface/60 px-4 py-4 text-[0.7rem] uppercase tracking-[0.28em] text-text disabled:opacity-40"
        >
          {busy === "jazzcash" ? "Redirecting…" : "JazzCash"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => startPk("easypaisa")}
          className="rounded-2xl border border-hairline bg-surface/60 px-4 py-4 text-[0.7rem] uppercase tracking-[0.28em] text-text disabled:opacity-40"
        >
          {busy === "easypaisa" ? "Redirecting…" : "Easypaisa"}
        </button>
      </div>
      {status && <p className="text-sm text-red-300/90">{status}</p>}
      <p className="text-xs text-muted">
        Pakistani wallet rails post to sandbox endpoints until merchant keys are live.
        Callbacks finalize orders server-side and redirect back here.
      </p>
    </div>
  );
}

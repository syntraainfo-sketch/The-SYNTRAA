"use client";

import { useEffect, useState } from "react";
import type { BankAccountDetails, CheckoutPaymentOptions } from "@syntraa/types";
import { apiFetch } from "@/lib/client-http";
import { useGuestStore } from "@/stores/guest";
import { cn } from "@/lib/utils";

type Method = "bank_transfer" | "easypaisa" | "cod";

type CustomerForm = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  bankReference: string;
};

const emptyForm: CustomerForm = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  bankReference: "",
};

export function CheckoutActions() {
  const guestToken = useGuestStore((s) => s.guestToken);
  const [options, setOptions] = useState<CheckoutPaymentOptions | null>(null);
  const [method, setMethod] = useState<Method>("bank_transfer");
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankAccountDetails | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch("/checkout/options");
        const body = (await res.json()) as { data?: CheckoutPaymentOptions };
        const data = body.data;
        if (!data) return;
        setOptions(data);
        setBankDetails(data.bankAccount ?? null);
        if (data.bankTransfer) setMethod("bank_transfer");
        else if (data.easypaisa) setMethod("easypaisa");
        else if (data.cod) setMethod("cod");
      } catch {
        setStatus("Payment options load nahi ho sakay.");
      }
    })();
  }, []);

  function updateForm<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateForm(): string | null {
    if (!form.customerName.trim()) return "Naam zaroori hai.";
    if (!form.phone.trim() || form.phone.trim().length < 7) return "Valid phone number likhein.";
    if (!form.address.trim() || form.address.trim().length < 5) return "Poora address likhein.";
    return null;
  }

  function payload() {
    return {
      ...form,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      bankReference: form.bankReference.trim() || undefined,
      ...(guestToken ? { guestToken } : {}),
    };
  }

  function postGateway(postUrl: string, fields: Record<string, string>) {
    const el = document.createElement("form");
    el.method = "POST";
    el.action = postUrl;
    for (const [k, v] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      el.appendChild(input);
    }
    document.body.appendChild(el);
    el.submit();
  }

  async function submitEasypaisa() {
    const err = validateForm();
    if (err) {
      setStatus(err);
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await apiFetch("/payments/easypaisa/initiate", {
        method: "POST",
        json: payload(),
      });
      const body = (await res.json()) as {
        data?: { postUrl?: string; fields?: Record<string, string> };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.postUrl || !body.data.fields) {
        throw new Error(body.error?.message || "Easypaisa unavailable");
      }
      postGateway(body.data.postUrl, body.data.fields);
    } catch (e) {
      setStatus((e as Error).message);
      setBusy(false);
    }
  }

  async function submitBankTransfer() {
    const err = validateForm();
    if (err) {
      setStatus(err);
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await apiFetch("/checkout/bank-transfer", {
        method: "POST",
        json: payload(),
      });
      const body = (await res.json()) as {
        data?: { orderNumber?: string };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.orderNumber) {
        throw new Error(body.error?.message || "Order place nahi hua");
      }
      window.location.href = `/checkout/complete?order=${encodeURIComponent(body.data.orderNumber)}&method=bank_transfer`;
    } catch (e) {
      setStatus((e as Error).message);
      setBusy(false);
    }
  }

  async function submitCod() {
    const err = validateForm();
    if (err) {
      setStatus(err);
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await apiFetch("/checkout/cod", {
        method: "POST",
        json: payload(),
      });
      const body = (await res.json()) as {
        data?: { orderNumber?: string };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.orderNumber) {
        throw new Error(body.error?.message || "Order place nahi hua");
      }
      window.location.href = `/checkout/complete?order=${encodeURIComponent(body.data.orderNumber)}&method=cod`;
    } catch (e) {
      setStatus((e as Error).message);
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (method === "easypaisa") return submitEasypaisa();
    if (method === "bank_transfer") return submitBankTransfer();
    return submitCod();
  }

  const methods = (
    [
      { id: "bank_transfer" as const, label: "Bank account", enabled: options?.bankTransfer !== false },
      { id: "easypaisa" as const, label: "Easypaisa", enabled: options?.easypaisa !== false },
      { id: "cod" as const, label: "Cash on delivery (COD)", enabled: options?.cod !== false },
    ] as const
  ).filter((m) => m.enabled);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-muted">
          Full name
          <input
            value={form.customerName}
            onChange={(e) => updateForm("customerName", e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-text"
            placeholder="Your name"
          />
        </label>
        <label className="space-y-2 text-sm text-muted">
          Phone
          <input
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-text"
            placeholder="03xx xxxxxxx"
          />
        </label>
        <label className="space-y-2 text-sm text-muted md:col-span-2">
          Email (optional)
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-text"
            placeholder="you@email.com"
          />
        </label>
        <label className="space-y-2 text-sm text-muted md:col-span-2">
          Delivery address
          <textarea
            value={form.address}
            onChange={(e) => updateForm("address", e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-text"
            placeholder="House, street, city"
          />
        </label>
      </div>

      <div className="space-y-4 border-t border-hairline pt-8">
        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-muted">Payment method</p>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                "rounded-lg px-4 py-2.5 font-sans text-sm transition-colors",
                method === m.id
                  ? "bg-[#2d2d2d] text-white"
                  : "bg-[#f3f3f3] text-[#666] hover:bg-[#ebebeb]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === "bank_transfer" && bankDetails ? (
          <div className="rounded-2xl border border-hairline bg-white/60 p-5 text-sm text-[#444]">
            <p className="font-medium text-[#111]">Transfer to our bank account</p>
            <ul className="mt-3 space-y-1">
              {bankDetails.bankName ? <li>Bank: {bankDetails.bankName}</li> : null}
              {bankDetails.accountTitle ? <li>Title: {bankDetails.accountTitle}</li> : null}
              {bankDetails.accountNumber ? (
                <li>Account #: {bankDetails.accountNumber}</li>
              ) : null}
              {bankDetails.iban ? <li>IBAN: {bankDetails.iban}</li> : null}
              {bankDetails.branch ? <li>Branch: {bankDetails.branch}</li> : null}
            </ul>
            {bankDetails.instructions ? (
              <p className="mt-3 text-muted">{bankDetails.instructions}</p>
            ) : null}
            <label className="mt-4 block space-y-2 text-muted">
              Transaction reference (optional)
              <input
                value={form.bankReference}
                onChange={(e) => updateForm("bankReference", e.target.value)}
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-text"
                placeholder="Receipt / txn ID"
              />
            </label>
          </div>
        ) : null}

        {method === "easypaisa" ? (
          <div className="rounded-2xl border border-hairline bg-white/60 p-5 text-sm text-[#444]">
            <p className="font-medium text-[#111]">Pay with Easypaisa</p>
            <p className="mt-2 text-muted">
              Order place hone ke baad aap Easypaisa app / portal par redirect honge.
            </p>
            {options?.easypaisaWallet ? (
              <p className="mt-2">
                Wallet: <strong>{options.easypaisaWallet}</strong>
              </p>
            ) : null}
          </div>
        ) : null}

        {method === "cod" ? (
          <div className="rounded-2xl border border-hairline bg-white/60 p-5 text-sm text-[#444]">
            <p className="font-medium text-[#111]">Cash on delivery</p>
            <p className="mt-2 text-muted">
              Delivery par cash se payment karein. Order confirm hone ke baad team aap se rabta
              karegi.
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        disabled={busy || methods.length === 0}
        onClick={handleSubmit}
        className="w-full rounded-full bg-[#c4a882] py-4 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] transition hover:bg-[#b89b72] disabled:opacity-50"
      >
        {busy
          ? "Processing…"
          : method === "easypaisa"
            ? "Continue to Easypaisa"
            : method === "bank_transfer"
              ? "Place order — bank transfer"
              : "Place order — COD"}
      </button>

      {status ? <p className="text-sm text-red-600">{status}</p> : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { BankAccountDetails, CheckoutPaymentOptions } from "@syntraa/types";
import { DEFAULT_CHECKOUT_OPTIONS } from "@/lib/checkout/defaults";
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

type CheckoutActionsProps = {
  initialOptions?: CheckoutPaymentOptions;
};

export function CheckoutActions({ initialOptions }: CheckoutActionsProps) {
  const guestToken = useGuestStore((s) => s.guestToken);
  const [options, setOptions] = useState<CheckoutPaymentOptions>(
    initialOptions ?? DEFAULT_CHECKOUT_OPTIONS
  );
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch("/checkout/options");
        if (!res.ok) return;
        const body = (await res.json()) as { data?: CheckoutPaymentOptions };
        if (!body.data) return;
        setOptions(body.data);
      } catch {
        /* keep initialOptions / defaults */
      }
    })();
  }, []);

  const bankDetails = options.bankAccount ?? DEFAULT_CHECKOUT_OPTIONS.bankAccount ?? null;

  const methods = useMemo(() => {
    const list = [
      { id: "bank_transfer" as const, label: "Bank account", on: options.bankTransfer !== false },
      { id: "easypaisa" as const, label: "Easypaisa", on: options.easypaisa !== false },
      { id: "cod" as const, label: "Cash on delivery (COD)", on: options.cod !== false },
    ];
    const enabled = list.filter((m) => m.on);
    return enabled.length > 0 ? enabled : list;
  }, [options]);

  const method = useMemo(() => {
    if (selectedMethod && methods.some((m) => m.id === selectedMethod)) {
      return selectedMethod;
    }
    return methods[0]?.id ?? "bank_transfer";
  }, [methods, selectedMethod]);

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

  return (
    <div className="space-y-8">
      {/* Payment methods first — always visible */}
      <section className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5">
        <p className="font-sans text-sm font-medium text-[#333]">Payment method</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMethod(m.id)}
              className={cn(
                "rounded-lg px-5 py-2.5 font-sans text-sm font-medium transition-colors",
                method === m.id
                  ? "bg-[#2d2d2d] text-white shadow-sm"
                  : "bg-white text-[#555] ring-1 ring-[#e0e0e0] hover:bg-[#f5f5f5]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === "bank_transfer" ? (
          <BankDetailsPanel
            bank={bankDetails}
            bankReference={form.bankReference}
            onReferenceChange={(v) => updateForm("bankReference", v)}
          />
        ) : null}

        {method === "easypaisa" ? (
          <div className="mt-4 rounded-xl border border-[#e8e8e8] bg-white p-4 text-sm text-[#444]">
            {options.easypaisaWallet ? (
              <p className="text-[#111]">
                Wallet: <strong>{options.easypaisaWallet}</strong>
              </p>
            ) : null}
            <PaymentScreenshotNote />
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <p className="font-sans text-sm font-medium text-[#333]">Delivery details</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={form.customerName} onChange={(v) => updateForm("customerName", v)} placeholder="Your name" />
          <Field label="Phone" value={form.phone} onChange={(v) => updateForm("phone", v)} placeholder="03xx xxxxxxx" />
          <div className="md:col-span-2">
            <Field label="Email (optional)" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="you@email.com" type="email" />
          </div>
          <div className="md:col-span-2">
            <label className="block space-y-2 font-sans text-sm text-[#666]">
              Delivery address
              <textarea
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[#111]"
                placeholder="House, street, city"
              />
            </label>
          </div>
        </div>
      </section>

      <button
        type="button"
        disabled={busy}
        onClick={handleSubmit}
        className="w-full rounded-full bg-[#c4a882] py-4 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] shadow-sm transition hover:bg-[#b89b72] disabled:opacity-50"
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

function PaymentScreenshotNote() {
  return (
    <p className="mt-3 text-sm leading-relaxed text-[#666]">
      After payment, please share your payment screenshot with our team.
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2 font-sans text-sm text-[#666]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-[#111]"
        placeholder={placeholder}
      />
    </label>
  );
}

function BankDetailsPanel({
  bank,
  bankReference,
  onReferenceChange,
}: {
  bank: BankAccountDetails | null;
  bankReference: string;
  onReferenceChange: (v: string) => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-[#e8e8e8] bg-white p-4 text-sm text-[#444]">
      <p className="font-medium text-[#111]">Bank account details</p>
      {bank?.bankName || bank?.accountNumber ? (
        <ul className="mt-3 space-y-1 text-[#333]">
          {bank.bankName ? <li>Bank: {bank.bankName}</li> : null}
          {bank.accountTitle ? <li>Account title: {bank.accountTitle}</li> : null}
          {bank.accountNumber ? <li>Account #: {bank.accountNumber}</li> : null}
          {bank.iban ? <li>IBAN: {bank.iban}</li> : null}
          {bank.branch ? <li>Branch: {bank.branch}</li> : null}
        </ul>
      ) : (
        <p className="mt-2 text-amber-800">
          Bank details abhi set nahi — Admin → Payments se account number add karein.
        </p>
      )}
      <PaymentScreenshotNote />
      <label className="mt-4 block space-y-2 text-[#666]">
        Transaction reference (optional)
        <input
          value={bankReference}
          onChange={(e) => onReferenceChange(e.target.value)}
          className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-[#111]"
          placeholder="Txn ID or note (screenshot shared separately)"
        />
      </label>
    </div>
  );
}

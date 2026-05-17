"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BankAccountDetails, CheckoutPaymentOptions } from "@syntraa/types";
import { DEFAULT_CHECKOUT_OPTIONS } from "@/lib/checkout/defaults";
import { apiFetch } from "@/lib/client-http";
import { useGuestStore } from "@/stores/guest";
import { cn } from "@/lib/utils";
import { PaymentScreenshotUpload } from "@/features/checkout/PaymentScreenshotUpload";

type Method = "bank_transfer" | "easypaisa" | "cod";

type CustomerForm = {
  contact: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  bankReference: string;
};

const emptyForm: CustomerForm = {
  contact: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  bankReference: "",
};

const inputClass =
  "w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-3 font-sans text-[15px] text-[#111] shadow-sm outline-none transition placeholder:text-[#999] focus:border-[#1773b0] focus:ring-1 focus:ring-[#1773b0]";

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
  const [paymentScreenshotPublicId, setPaymentScreenshotPublicId] = useState<string | null>(
    null
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch("/checkout/options");
        if (!res.ok) return;
        const body = (await res.json()) as { data?: CheckoutPaymentOptions };
        if (!body.data) return;
        setOptions(body.data);
      } catch {
        /* keep initialOptions */
      }
    })();
  }, []);

  const bankDetails = options.bankAccount ?? DEFAULT_CHECKOUT_OPTIONS.bankAccount ?? null;

  const methods = useMemo(() => {
    const list = [
      { id: "cod" as const, label: "Cash on Delivery (COD)", on: options.cod !== false },
      { id: "bank_transfer" as const, label: "Bank Deposit", on: options.bankTransfer !== false },
      { id: "easypaisa" as const, label: "Easypaisa", on: options.easypaisa !== false },
    ];
    const enabled = list.filter((m) => m.on);
    return enabled.length > 0 ? enabled : list;
  }, [options]);

  const method = useMemo(() => {
    if (selectedMethod && methods.some((m) => m.id === selectedMethod)) {
      return selectedMethod;
    }
    return methods[0]?.id ?? "cod";
  }, [methods, selectedMethod]);

  function selectMethod(id: Method) {
    setSelectedMethod(id);
    setPaymentScreenshotPublicId(null);
  }

  function updateForm<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildAddress(): string {
    const parts = [form.address.trim(), form.city.trim(), form.postalCode.trim()].filter(
      Boolean
    );
    return parts.join(", ");
  }

  function buildEmail(): string | undefined {
    const c = form.contact.trim();
    if (c.includes("@")) return c;
    return undefined;
  }

  function buildPhone(): string {
    const c = form.contact.trim();
    if (c && !c.includes("@")) return c;
    return form.phone.trim();
  }

  function validateForm(): string | null {
    if (!form.contact.trim() && !form.phone.trim()) {
      return "Enter your email or mobile phone number.";
    }
    if (!form.firstName.trim()) return "Enter your first name.";
    if (!form.lastName.trim()) return "Enter your last name.";
    const phone = buildPhone();
    if (!phone || phone.length < 7) return "Enter a valid phone number.";
    if (!form.address.trim()) return "Enter your address.";
    if (!form.city.trim()) return "Enter your city.";
    if (buildAddress().length < 5) return "Enter a complete delivery address.";
    return null;
  }

  function payload() {
    const email = buildEmail() ?? "";
    const phone = buildPhone();
    return {
      customerName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      phone,
      email,
      address: buildAddress(),
      bankReference: form.bankReference.trim() || undefined,
      ...(paymentScreenshotPublicId ? { paymentScreenshotPublicId } : {}),
      ...(guestToken ? { guestToken } : {}),
    };
  }

  function validatePaymentProof(): string | null {
    if (method === "bank_transfer" && !paymentScreenshotPublicId) {
      return "Please upload your payment screenshot before completing the order.";
    }
    return null;
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
    const err = validateForm() ?? validatePaymentProof();
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
    const err = validateForm() ?? validatePaymentProof();
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
        throw new Error(body.error?.message || "Could not place order");
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
        throw new Error(body.error?.message || "Could not place order");
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
      {/* Contact */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-[17px] font-semibold text-[#111]">Contact</h2>
          <Link href="/login" className="text-sm text-[#1773b0] hover:underline">
            Sign in
          </Link>
        </div>
        <input
          type="text"
          value={form.contact}
          onChange={(e) => updateForm("contact", e.target.value)}
          className={inputClass}
          placeholder="Email or mobile phone number"
          autoComplete="email tel"
        />
      </section>

      {/* Delivery */}
      <section className="space-y-3">
        <h2 className="font-sans text-[17px] font-semibold text-[#111]">Delivery</h2>
        <select className={inputClass} defaultValue="PK" disabled aria-label="Country">
          <option value="PK">Pakistan</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateForm("firstName", e.target.value)}
            className={inputClass}
            placeholder="First name"
            autoComplete="given-name"
          />
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateForm("lastName", e.target.value)}
            className={inputClass}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
        <input
          type="text"
          value={form.address}
          onChange={(e) => updateForm("address", e.target.value)}
          className={inputClass}
          placeholder="Address"
          autoComplete="street-address"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateForm("city", e.target.value)}
            className={inputClass}
            placeholder="City"
            autoComplete="address-level2"
          />
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => updateForm("postalCode", e.target.value)}
            className={inputClass}
            placeholder="Postal code (optional)"
            autoComplete="postal-code"
          />
        </div>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateForm("phone", e.target.value)}
          className={inputClass}
          placeholder="Phone"
          autoComplete="tel"
        />
      </section>

      {/* Shipping */}
      <section className="space-y-3">
        <h2 className="font-sans text-[17px] font-semibold text-[#111]">Shipping method</h2>
        <div className="rounded-md border border-[#1773b0] bg-[#f0f5ff] px-4 py-3.5 text-sm">
          <span className="font-medium text-[#111]">Delivery</span>
        </div>
      </section>

      {/* Payment */}
      <section className="space-y-3">
        <h2 className="font-sans text-[17px] font-semibold text-[#111]">Payment</h2>
        <p className="text-sm text-[#666]">All transactions are secure and encrypted.</p>
        <div className="space-y-0 overflow-hidden rounded-md border border-[#d9d9d9]">
          {methods.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                i > 0 && "border-t border-[#d9d9d9]",
                method === m.id && "bg-[#f0f5ff]"
              )}
            >
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5">
                <input
                  type="radio"
                  name="payment"
                  checked={method === m.id}
                  onChange={() => selectMethod(m.id)}
                  className="h-4 w-4 accent-[#1773b0]"
                />
                <span className="font-sans text-[15px] text-[#111]">{m.label}</span>
              </label>

              {method === m.id && m.id === "bank_transfer" ? (
                <BankDetailsPanel
                  bank={bankDetails}
                  bankReference={form.bankReference}
                  onReferenceChange={(v) => updateForm("bankReference", v)}
                  paymentScreenshotPublicId={paymentScreenshotPublicId}
                  onScreenshotChange={setPaymentScreenshotPublicId}
                />
              ) : null}

              {method === m.id && m.id === "easypaisa" ? (
                <div className="border-t border-[#d9d9d9] bg-white px-4 pb-4">
                  {options.easypaisaWallet ? (
                    <p className="pt-2 text-sm text-[#333]">
                      Wallet: <strong>{options.easypaisaWallet}</strong>
                    </p>
                  ) : null}
                  <PaymentScreenshotUpload
                    publicId={paymentScreenshotPublicId}
                    onPublicIdChange={setPaymentScreenshotPublicId}
                    compact
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Billing */}
      <section className="space-y-3">
        <h2 className="font-sans text-[17px] font-semibold text-[#111]">Billing address</h2>
        <div className="rounded-md border border-[#d9d9d9] bg-[#f0f5ff] px-4 py-3.5">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="billing"
              checked
              readOnly
              className="h-4 w-4 accent-[#1773b0]"
            />
            <span className="font-sans text-[15px] text-[#111]">Same as shipping address</span>
          </label>
        </div>
      </section>

      {status ? <p className="text-sm text-red-600">{status}</p> : null}

      <button
        type="button"
        disabled={busy}
        onClick={handleSubmit}
        className="w-full rounded-md bg-[#1773b0] py-4 font-sans text-[15px] font-medium text-white shadow-sm transition hover:bg-[#1360a0] disabled:opacity-60"
      >
        {busy ? "Processing…" : "Complete order"}
      </button>

      <Link
        href="/cart"
        className="block text-center font-sans text-sm text-[#1773b0] hover:underline"
      >
        Return to cart
      </Link>
    </div>
  );
}

function BankDetailsPanel({
  bank,
  bankReference,
  onReferenceChange,
  paymentScreenshotPublicId,
  onScreenshotChange,
}: {
  bank: BankAccountDetails | null;
  bankReference: string;
  onReferenceChange: (v: string) => void;
  paymentScreenshotPublicId: string | null;
  onScreenshotChange: (id: string | null) => void;
}) {
  const inputClass =
    "w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-2.5 font-sans text-sm text-[#111] outline-none focus:border-[#1773b0] focus:ring-1 focus:ring-[#1773b0]";

  return (
    <div className="border-t border-[#d9d9d9] bg-white px-4 pb-4 pt-2 text-sm text-[#333]">
      {bank?.bankName || bank?.accountNumber ? (
        <ul className="space-y-1 py-2">
          {bank.bankName ? <li>Bank: {bank.bankName}</li> : null}
          {bank.accountTitle ? <li>Account title: {bank.accountTitle}</li> : null}
          {bank.accountNumber ? <li>Account #: {bank.accountNumber}</li> : null}
          {bank.iban ? <li>IBAN: {bank.iban}</li> : null}
          {bank.branch ? <li>Branch: {bank.branch}</li> : null}
        </ul>
      ) : (
        <p className="py-2 text-amber-800">Bank details are not configured yet.</p>
      )}
      <PaymentScreenshotUpload
        publicId={paymentScreenshotPublicId}
        onPublicIdChange={onScreenshotChange}
        required
        compact
      />
      <label className="mt-3 block space-y-1.5 text-[#666]">
        Transaction reference (optional)
        <input
          value={bankReference}
          onChange={(e) => onReferenceChange(e.target.value)}
          className={inputClass}
          placeholder="Txn ID or note"
        />
      </label>
    </div>
  );
}

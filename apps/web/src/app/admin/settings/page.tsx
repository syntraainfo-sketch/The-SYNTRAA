"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-http";
import { Button } from "@/components/ui/button";

type BankForm = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branch: string;
  instructions: string;
};

type FlagsForm = {
  bankTransfer: boolean;
  easypaisa: boolean;
  cod: boolean;
};

export default function AdminSettingsPage() {
  const [bank, setBank] = useState<BankForm>({
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    branch: "",
    instructions: "",
  });
  const [easypaisaWallet, setEasypaisaWallet] = useState("");
  const [flags, setFlags] = useState<FlagsForm>({
    bankTransfer: true,
    easypaisa: true,
    cod: true,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/admin/settings");
      const body = (await res.json()) as {
        data?: {
          bankAccount?: BankForm;
          easypaisaWallet?: string;
          paymentFlags?: FlagsForm;
        };
      };
      const d = body.data;
      if (!d) return;
      if (d.bankAccount) setBank({ ...bank, ...d.bankAccount });
      if (d.easypaisaWallet) setEasypaisaWallet(d.easypaisaWallet);
      if (d.paymentFlags) setFlags({ ...flags, ...d.paymentFlags });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PATCH",
        json: {
          bankAccount: bank,
          easypaisaWallet,
          paymentFlags: flags,
        },
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Settings saved.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-10 py-12">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">Admin · Settings</p>
        <h1 className="mt-4 font-display text-4xl text-text">Payments</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted">
          Bank account details checkout par dikhengi. Easypaisa wallet optional hai (manual
          transfer ke liye).
        </p>
      </div>

      <section className="glass-panel space-y-4 rounded-3xl p-6">
        <h2 className="font-display text-xl text-text">Bank account</h2>
        {(
          [
            ["bankName", "Bank name"],
            ["accountTitle", "Account title"],
            ["accountNumber", "Account number"],
            ["iban", "IBAN"],
            ["branch", "Branch"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1 text-sm text-muted">
            {label}
            <input
              value={bank[key]}
              onChange={(e) => setBank((b) => ({ ...b, [key]: e.target.value }))}
              className="w-full rounded-xl border border-hairline bg-white/10 px-3 py-2 text-text"
            />
          </label>
        ))}
        <label className="block space-y-1 text-sm text-muted">
          Instructions
          <textarea
            value={bank.instructions}
            onChange={(e) => setBank((b) => ({ ...b, instructions: e.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-hairline bg-white/10 px-3 py-2 text-text"
          />
        </label>
      </section>

      <section className="glass-panel space-y-4 rounded-3xl p-6">
        <h2 className="font-display text-xl text-text">Easypaisa</h2>
        <label className="block space-y-1 text-sm text-muted">
          Wallet number (optional, display only)
          <input
            value={easypaisaWallet}
            onChange={(e) => setEasypaisaWallet(e.target.value)}
            className="w-full rounded-xl border border-hairline bg-white/10 px-3 py-2 text-text"
            placeholder="03xx xxxxxxx"
          />
        </label>
      </section>

      <section className="glass-panel space-y-3 rounded-3xl p-6">
        <h2 className="font-display text-xl text-text">Checkout methods</h2>
        {(
          [
            ["bankTransfer", "Bank transfer"],
            ["easypaisa", "Easypaisa"],
            ["cod", "Cash on delivery"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={flags[key]}
              onChange={(e) => setFlags((f) => ({ ...f, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </section>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
      {msg ? <p className="text-sm text-muted">{msg}</p> : null}
    </main>
  );
}

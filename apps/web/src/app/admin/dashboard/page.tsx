"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-http";
import { isLikelyAdminSession } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<{
    revenue: number;
    fulfilledOrders: number;
    pendingPaymentOrders: number;
  } | null>(null);

  useEffect(() => {
    if (!isLikelyAdminSession()) router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiFetch("/admin/analytics/overview");
        const body = (await res.json()) as {
          data?: {
            revenue: number;
            fulfilledOrders: number;
            pendingPaymentOrders: number;
          };
        };
        if (!res.ok) throw new Error("no access");
        setSnapshot(body.data ?? null);
      } catch {
        setSnapshot(null);
      }
    };
    void run();
  }, []);

  return (
    <main className="space-y-10 py-12">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
          Telemetry
        </p>
        <h1 className="font-display mt-4 text-4xl text-text">
          Operational overview
        </h1>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-hairline/70 bg-black/38 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Revenue (USD)</p>
          <p className="mt-4 font-display text-4xl">
            ${snapshot?.revenue?.toFixed(2) ?? "—"}
          </p>
        </div>
        <div className="rounded-3xl border border-hairline/70 bg-black/38 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Paid orders</p>
          <p className="mt-4 font-display text-4xl">{snapshot?.fulfilledOrders ?? "—"}</p>
        </div>
        <div className="rounded-3xl border border-hairline/70 bg-black/38 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Pending treasury</p>
          <p className="mt-4 font-display text-4xl">
            {snapshot?.pendingPaymentOrders ?? "—"}
          </p>
        </div>
      </div>
    </main>
  );
}

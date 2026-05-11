"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-http";

interface OrderSummary {
  orderNumber?: string;
  status?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/admin/orders");
      const body = (await res.json()) as { data?: OrderSummary[] };
      setOrders(body.data ?? []);
    })();
  }, []);

  return (
    <main className="space-y-10 py-12">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
          Logistics
        </p>
        <h1 className="font-display mt-4 text-3xl text-text">Orders</h1>
      </header>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.24em] text-muted">
          <tr>
            <th className="pb-4">Reference</th>
            <th className="pb-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderNumber} className="border-t border-hairline/70">
              <td className="py-4">{o.orderNumber}</td>
              <td className="py-4 text-muted">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

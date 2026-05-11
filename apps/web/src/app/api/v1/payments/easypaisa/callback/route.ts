import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { env } from "@/server/config/env";
import { Order } from "@/server/models/Order";
import { Cart } from "@/server/models/Cart";
import { verifyEasypaisaCallback } from "@/server/services/pkPayments";

export const runtime = "nodejs";

async function parseFormBody(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  const raw = await req.text();
  if (ct.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    const body: Record<string, string> = {};
    for (const [k, v] of params.entries()) body[k] = v;
    return body;
  }
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(j)) {
      if (v != null) out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const body = await parseFormBody(req);
    if (!verifyEasypaisaCallback(body)) {
      return new NextResponse("Invalid signature", { status: 400 });
    }
    const ref = body.orderRef ?? body.merchantOrderReference ?? "";
    const order = await Order.findOne({ orderNumber: ref });
    if (!order) return new NextResponse("Order not found", { status: 404 });
    order.status = "paid";
    order.payment ??= { provider: "easypaisa", status: "succeeded" };
    order.payment.provider = "easypaisa";
    order.payment.status = "succeeded";
    order.payment.txnRef = body.transactionId;
    order.payment.rawPayload = body;
    order.payment.paidAt = new Date();
    await order.save();
    if (order.customerId) await Cart.deleteOne({ userId: order.customerId });
    if (order.guestToken) await Cart.deleteOne({ guestToken: order.guestToken });
    return NextResponse.redirect(
      `${env.webPublicUrl}/checkout/complete?order=${encodeURIComponent(order.orderNumber)}`,
      302
    );
  });
}

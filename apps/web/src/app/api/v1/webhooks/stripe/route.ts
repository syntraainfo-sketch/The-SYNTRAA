import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { getStripe } from "@/server/services/stripeService";
import { env } from "@/server/config/env";
import { WebhookEvent } from "@/server/models/WebhookEvent";
import { Order } from "@/server/models/Order";
import { Cart } from "@/server/models/Cart";

export const runtime = "nodejs";

async function clearCartForOrder(order: InstanceType<typeof Order>) {
  try {
    if (order.customerId) {
      await Cart.deleteOne({ userId: order.customerId });
    }
    if (order.guestToken) {
      await Cart.deleteOne({ guestToken: order.guestToken });
    }
  } catch {
    /* non-fatal */
  }
}

export async function POST(req: NextRequest) {
  await connectMongo();
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return new NextResponse("Stripe webhook unavailable", { status: 503 });
  }
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.stripeWebhookSecret);
  } catch {
    return new NextResponse("Stripe signature verification failed", {
      status: 400,
    });
  }

  try {
    await WebhookEvent.create({ provider: "stripe", externalId: event.id });
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e ? (e as { code?: number }).code : undefined;
    if (code === 11000) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw e;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderIdStr = session.metadata?.orderId;
    if (!orderIdStr || !mongoose.isValidObjectId(orderIdStr)) {
      return NextResponse.json({ received: true });
    }
    const order = await Order.findById(orderIdStr);
    if (
      order &&
      (order.status === "pending_payment" || order.status === "paid")
    ) {
      order.status = "paid";
      order.payment ??= {
        provider: "stripe",
        status: "succeeded",
      };
      order.payment.provider = "stripe";
      order.payment.intentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id;
      order.payment.status = session.payment_status ?? "paid";
      order.payment.paidAt = new Date();
      await order.save();
      await clearCartForOrder(order);
    }
  }

  return NextResponse.json({ received: true });
}

import type { Request, Response } from "express";
import Stripe from "stripe";
import { getStripe } from "../../services/stripeService";
import { env } from "../../config/env";
import { WebhookEvent } from "../../models/WebhookEvent";
import { Order } from "../../models/Order";
import { Cart } from "../../models/Cart";
import mongoose from "mongoose";

export async function stripeWebhookHandler(req: Request, res: Response) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return res.status(503).send("Stripe webhook unavailable");
  }
  let event: Stripe.Event;
  try {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).send("Missing signature");
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.stripeWebhookSecret
    );
  } catch {
    return res.status(400).send("Stripe signature verification failed");
  }

  try {
    await WebhookEvent.create({ provider: "stripe", externalId: event.id });
  } catch {
    return res.status(200).json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderIdStr = session.metadata?.orderId;
    if (!orderIdStr || !mongoose.isValidObjectId(orderIdStr))
      return res.status(200).json({ received: true });
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

  return res.status(200).json({ received: true });
}

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

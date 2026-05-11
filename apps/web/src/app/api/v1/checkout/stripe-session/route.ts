import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { stripeCheckoutSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { hydrateCartLines } from "@/server/services/hydrateCart";
import { createPendingOrder } from "@/server/services/orderDraft";
import { getStripe } from "@/server/services/stripeService";
import { AppError } from "@/server/utils/AppError";
import { env } from "@/server/config/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const input = validateBody(stripeCheckoutSchema, await req.json());
    const stripe = getStripe();
    if (!stripe) throw new AppError(503, "Stripe not configured");

    const { lines, subtotalUSD } = await hydrateCartLines(
      user?.sub,
      input.guestToken
    );

    const order = await createPendingOrder(lines, subtotalUSD, {
      customerId:
        user?.sub && mongoose.isValidObjectId(user.sub)
          ? new mongoose.Types.ObjectId(user.sub)
          : undefined,
      guestToken: user?.sub ? undefined : input.guestToken,
    });

    const base = input.successUrl?.replace(/\/$/, "") ?? env.webPublicUrl;
    const successUrl = `${base}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = input.cancelUrl ?? `${env.webPublicUrl}/cart`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(l.unitPriceUSD * 100),
          product_data: {
            name: `${l.title} (${l.sku})`,
            images:
              l.imagePublicId && env.cloudinary.cloudName
                ? [
                    `https://res.cloudinary.com/${env.cloudinary.cloudName}/image/upload/f_auto,q_auto,w_640/${l.imagePublicId}`,
                  ]
                : undefined,
          },
        },
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
      client_reference_id: order.orderNumber,
    });

    order.payment ??= {};
    order.payment.provider = "stripe";
    order.payment.intentId = session.id;
    order.payment.status = session.payment_status ?? "created";
    await order.save();

    return NextResponse.json({
      data: {
        checkoutUrl: session.url,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });
  });
}

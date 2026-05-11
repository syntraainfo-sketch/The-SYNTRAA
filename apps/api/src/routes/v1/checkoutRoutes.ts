import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/asyncHandler";
import { optionalAuth } from "../../middleware/requireAuth";
import { pkInitSchema, stripeCheckoutSchema } from "../../validators/schemas";
import { validateBody } from "../../utils/validateBody";
import { hydrateCartLines } from "../../services/hydrateCart";
import { createPendingOrder } from "../../services/orderDraft";
import { getStripe } from "../../services/stripeService";
import { AppError } from "../../utils/AppError";
import { env } from "../../config/env";
import { buildJazzcashFormFields } from "../../services/pkPayments";
import { hmacSha256Hex } from "../../utils/cryptoHash";

export const checkoutRouter = Router();

checkoutRouter.post(
  "/checkout/stripe-session",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const input = validateBody(stripeCheckoutSchema, req);
    const stripe = getStripe();
    if (!stripe) throw new AppError(503, "Stripe not configured");

    const { lines, subtotalUSD } = await hydrateCartLines(
      req.user?.sub,
      input.guestToken
    );

    const order = await createPendingOrder(lines, subtotalUSD, {
      customerId:
        req.user?.sub && mongoose.isValidObjectId(req.user.sub)
          ? new mongoose.Types.ObjectId(req.user.sub)
          : undefined,
      guestToken: req.user?.sub ? undefined : input.guestToken,
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

    res.json({
      data: {
        checkoutUrl: session.url,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });
  })
);

checkoutRouter.post(
  "/payments/:provider/initiate",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const provider = req.params.provider;
    if (!["jazzcash", "easypaisa"].includes(provider)) {
      throw new AppError(400, "Unknown provider");
    }
    const input = validateBody(pkInitSchema, req);

    const { lines, subtotalUSD } = await hydrateCartLines(
      req.user?.sub,
      input.guestToken
    );

    const order = await createPendingOrder(lines, subtotalUSD, {
      customerId:
        req.user?.sub && mongoose.isValidObjectId(req.user.sub)
          ? new mongoose.Types.ObjectId(req.user.sub)
          : undefined,
      guestToken: req.user?.sub ? undefined : input.guestToken,
    });

    const amountUsd = Math.max(subtotalUSD, 1);
    const amountPkr = Math.round(amountUsd * env.pkrPerUsd);

    if (provider === "jazzcash") {
      order.payment ??= {};
      order.payment.provider = "jazzcash";
      order.payment.status = "pending_redirect";
      await order.save();

      const fields = buildJazzcashFormFields({
        amountPkr,
        billReference: order.orderNumber,
        description: `THE SYNTRAA order ${order.orderNumber}`,
      });

      const postUrl = env.jazzcash.postUrl;
      res.json({
        data: {
          provider: "jazzcash",
          postUrl,
          fields,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        },
      });
      return;
    }

    const storeId = env.easypaisa.storeId;
    const txnId = cryptoRandom();
    const fields: Record<string, string> = {
      storeId,
      transactionAmount: String(amountPkr),
      merchantOrderReference: order.orderNumber,
      orderRef: order.orderNumber,
      transactionId: txnId,
      returnUrl:
        env.easypaisa.returnUrl || `${env.webPublicUrl}/checkout/complete`,
    };
    // Hash placeholder aligned with PSP — replace validateEasypaisa fields in production docs
    fields.secureHash = hmacSha256Hex(
      env.easypaisa.hashKey || "sandbox",
      `${fields.orderRef}|${fields.transactionAmount}|${fields.transactionId}`
    );

    order.payment ??= {};
    order.payment.provider = "easypaisa";
    order.payment.txnRef = txnId;
    order.payment.status = "pending_redirect";
    await order.save();

    res.json({
      data: {
        provider: "easypaisa",
        postUrl: env.easypaisa.postUrl,
        fields,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });
  })
);

function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

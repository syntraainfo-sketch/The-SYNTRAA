import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { manualCheckoutSchema, pkInitSchema } from "@/server/validators/schemas";
import { getGlobalSettings } from "@/server/services/cartCheckout";
import { validateBody } from "@/server/utils/validateBody";
import { hydrateCartLines } from "@/server/services/hydrateCart";
import { createPendingOrder } from "@/server/services/orderDraft";
import { AppError } from "@/server/utils/AppError";
import { env } from "@/server/config/env";
import { buildJazzcashFormFields } from "@/server/services/pkPayments";
import { hmacSha256Hex } from "@/server/utils/cryptoHash";

export const runtime = "nodejs";

function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ provider: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const { provider } = await ctx.params;
    if (!["jazzcash", "easypaisa"].includes(provider)) {
      throw new AppError(400, "Unknown provider");
    }
    const raw = await req.json();
    const guestToken =
      typeof raw?.guestToken === "string" ? raw.guestToken : undefined;

    const settings = await getGlobalSettings();
    if (provider === "easypaisa" && settings.paymentFlags?.easypaisa === false) {
      throw new AppError(400, "Easypaisa is not available");
    }

    const { lines, subtotalUSD } = await hydrateCartLines(user?.sub, guestToken);

    let customerEmail: string | undefined;
    let shippingAddress: Record<string, string> | undefined;

    if (provider === "easypaisa") {
      const checkout = validateBody(manualCheckoutSchema, raw);
      customerEmail = checkout.email?.trim() || undefined;
      shippingAddress = {
        name: checkout.customerName.trim(),
        phone: checkout.phone.trim(),
        address: checkout.address.trim(),
      };
    } else {
      validateBody(pkInitSchema, raw);
    }

    const order = await createPendingOrder(lines, subtotalUSD, {
      customerId:
        user?.sub && mongoose.isValidObjectId(user.sub)
          ? new mongoose.Types.ObjectId(user.sub)
          : undefined,
      customerEmail,
      guestToken: user?.sub ? undefined : guestToken,
    });

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

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
      return NextResponse.json({
        data: {
          provider: "jazzcash",
          postUrl,
          fields,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        },
      });
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
    fields.secureHash = hmacSha256Hex(
      env.easypaisa.hashKey || "sandbox",
      `${fields.orderRef}|${fields.transactionAmount}|${fields.transactionId}`
    );

    order.payment ??= {};
    order.payment.provider = "easypaisa";
    order.payment.txnRef = txnId;
    order.payment.status = "pending_redirect";
    await order.save();

    return NextResponse.json({
      data: {
        provider: "easypaisa",
        postUrl: env.easypaisa.postUrl,
        fields,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });
  });
}

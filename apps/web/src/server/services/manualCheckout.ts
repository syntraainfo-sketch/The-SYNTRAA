import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";
import type { z } from "zod";
import type { manualCheckoutSchema } from "../validators/schemas";
import { AppError } from "../utils/AppError";
import { hydrateCartLines } from "./hydrateCart";
import { createPendingOrder } from "./orderDraft";
import { clearCartForOrder } from "./cartCheckout";
import type { OrderDoc } from "../models/Order";

type ManualInput = z.infer<typeof manualCheckoutSchema>;

export async function placeManualOrder(
  input: ManualInput,
  userId: string | undefined,
  provider: "bank_transfer" | "cod"
): Promise<HydratedDocument<OrderDoc>> {
  const { lines, subtotalUSD } = await hydrateCartLines(userId, input.guestToken);
  if (!lines.length) throw new AppError(400, "Cart is empty");

  const order = await createPendingOrder(lines, subtotalUSD, {
    customerId:
      userId && mongoose.isValidObjectId(userId)
        ? new mongoose.Types.ObjectId(userId)
        : undefined,
    customerEmail: input.email?.trim() || undefined,
    guestToken: userId ? undefined : input.guestToken,
  });

  order.shippingAddress = {
    name: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
  };

  if (provider === "bank_transfer") {
    if (!input.paymentScreenshotPublicId?.trim()) {
      throw new AppError(400, "Payment screenshot is required for bank transfer.");
    }
    order.payment = {
      provider: "bank_transfer",
      status: "awaiting_transfer",
      txnRef: input.bankReference?.trim() || undefined,
      customerNote: input.bankReference?.trim() || undefined,
      proofPublicId: input.paymentScreenshotPublicId.trim(),
    };
    order.status = "pending_payment";
  } else {
    order.payment = {
      provider: "cod",
      status: "pending_cod",
    };
    order.status = "processing";
  }

  await order.save();
  await clearCartForOrder(order);
  return order;
}

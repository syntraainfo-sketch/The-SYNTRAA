import type { HydratedCartLine } from "./hydrateCart";
import type { HydratedDocument } from "mongoose";
import { Order } from "../models/Order";
import type { OrderDoc } from "../models/Order";
import { generateOrderNumber } from "./orders";
import mongoose from "mongoose";

export async function createPendingOrder(
  lines: HydratedCartLine[],
  subtotalUSD: number,
  opts: {
    customerId?: mongoose.Types.ObjectId;
    customerEmail?: string;
    guestToken?: string;
  }
): Promise<HydratedDocument<OrderDoc>> {
  const orderNumber = generateOrderNumber();
  const orderLines = lines.map((l) => ({
    sku: l.sku,
    title: l.title,
    quantity: l.quantity,
    unitPriceUSD: l.unitPriceUSD,
    imagePublicId: l.imagePublicId,
    productId: new mongoose.Types.ObjectId(l.productId),
  }));

  const order = await Order.create({
    orderNumber,
    customerId: opts.customerId,
    customerEmail: opts.customerEmail,
    guestToken: opts.guestToken,
    items: orderLines,
    subtotalUSD,
    currency: "USD",
    status: "pending_payment",
  });
  return order;
}

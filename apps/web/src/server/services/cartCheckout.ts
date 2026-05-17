import type { HydratedDocument } from "mongoose";
import { Cart } from "../models/Cart";
import type { OrderDoc } from "../models/Order";
import { Settings } from "../models/Settings";

export async function clearCartForOrder(order: HydratedDocument<OrderDoc>) {
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

export async function getGlobalSettings() {
  let s = await Settings.findById("global");
  if (!s) {
    s = await Settings.create({ _id: "global" });
  }
  return s;
}

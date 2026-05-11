import { Router } from "express";
import express from "express";
import { env } from "../../config/env";
import { Order } from "../../models/Order";
import { Cart } from "../../models/Cart";
import { verifyEasypaisaCallback, verifyJazzcashCallback } from "../../services/pkPayments";
import { asyncHandler } from "../../middleware/asyncHandler";

export const pkCallbacksRouter = Router();

pkCallbacksRouter.post(
  "/payments/jazzcash/callback",
  express.urlencoded({ extended: true }),
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, string>;
    if (
      !verifyJazzcashCallback(body as unknown as Record<string, unknown>)
    ) {
      return res.status(400).send("Invalid signature");
    }
    const ref =
      body.pp_BillReference ?? body.billReference ?? body.merchantOrderReference;
    if (!ref) return res.status(400).send("Missing reference");
    const order = await Order.findOne({ orderNumber: ref });
    if (!order) return res.status(404).send("Order not found");
    const code = body.pp_ResponseCode ?? body.responseCode ?? "";
    const success = code === "000" || code === "00" || code === "success";
    if (success) {
      order.status = "paid";
      order.payment ??= { provider: "jazzcash", status: "succeeded" };
      order.payment.provider = "jazzcash";
      order.payment.status = "succeeded";
      order.payment.rawPayload = body;
      order.payment.paidAt = new Date();
      await order.save();
      if (order.customerId) await Cart.deleteOne({ userId: order.customerId });
      if (order.guestToken) await Cart.deleteOne({ guestToken: order.guestToken });
    }
    return res.redirect(
      302,
      `${env.webPublicUrl}/checkout/complete?order=${encodeURIComponent(order.orderNumber)}`
    );
  })
);

pkCallbacksRouter.post(
  "/payments/easypaisa/callback",
  express.urlencoded({ extended: true }),
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, string>;
    if (!verifyEasypaisaCallback(body)) {
      return res.status(400).send("Invalid signature");
    }
    const ref = body.orderRef ?? body.merchantOrderReference ?? "";
    const order = await Order.findOne({ orderNumber: ref });
    if (!order) return res.status(404).send("Order not found");
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
    return res.redirect(
      302,
      `${env.webPublicUrl}/checkout/complete?order=${encodeURIComponent(order.orderNumber)}`
    );
  })
);

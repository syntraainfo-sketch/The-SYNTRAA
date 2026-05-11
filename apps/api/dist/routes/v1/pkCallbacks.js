"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pkCallbacksRouter = void 0;
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const env_1 = require("../../config/env");
const Order_1 = require("../../models/Order");
const Cart_1 = require("../../models/Cart");
const pkPayments_1 = require("../../services/pkPayments");
const asyncHandler_1 = require("../../middleware/asyncHandler");
exports.pkCallbacksRouter = (0, express_1.Router)();
exports.pkCallbacksRouter.post("/payments/jazzcash/callback", express_2.default.urlencoded({ extended: true }), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    if (!(0, pkPayments_1.verifyJazzcashCallback)(body)) {
        return res.status(400).send("Invalid signature");
    }
    const ref = body.pp_BillReference ?? body.billReference ?? body.merchantOrderReference;
    if (!ref)
        return res.status(400).send("Missing reference");
    const order = await Order_1.Order.findOne({ orderNumber: ref });
    if (!order)
        return res.status(404).send("Order not found");
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
        if (order.customerId)
            await Cart_1.Cart.deleteOne({ userId: order.customerId });
        if (order.guestToken)
            await Cart_1.Cart.deleteOne({ guestToken: order.guestToken });
    }
    return res.redirect(302, `${env_1.env.webPublicUrl}/checkout/complete?order=${encodeURIComponent(order.orderNumber)}`);
}));
exports.pkCallbacksRouter.post("/payments/easypaisa/callback", express_2.default.urlencoded({ extended: true }), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    if (!(0, pkPayments_1.verifyEasypaisaCallback)(body)) {
        return res.status(400).send("Invalid signature");
    }
    const ref = body.orderRef ?? body.merchantOrderReference ?? "";
    const order = await Order_1.Order.findOne({ orderNumber: ref });
    if (!order)
        return res.status(404).send("Order not found");
    order.status = "paid";
    order.payment ??= { provider: "easypaisa", status: "succeeded" };
    order.payment.provider = "easypaisa";
    order.payment.status = "succeeded";
    order.payment.txnRef = body.transactionId;
    order.payment.rawPayload = body;
    order.payment.paidAt = new Date();
    await order.save();
    if (order.customerId)
        await Cart_1.Cart.deleteOne({ userId: order.customerId });
    if (order.guestToken)
        await Cart_1.Cart.deleteOne({ guestToken: order.guestToken });
    return res.redirect(302, `${env_1.env.webPublicUrl}/checkout/complete?order=${encodeURIComponent(order.orderNumber)}`);
}));

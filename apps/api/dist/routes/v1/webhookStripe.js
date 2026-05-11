"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = stripeWebhookHandler;
const stripeService_1 = require("../../services/stripeService");
const env_1 = require("../../config/env");
const WebhookEvent_1 = require("../../models/WebhookEvent");
const Order_1 = require("../../models/Order");
const Cart_1 = require("../../models/Cart");
const mongoose_1 = __importDefault(require("mongoose"));
async function stripeWebhookHandler(req, res) {
    const stripe = (0, stripeService_1.getStripe)();
    if (!stripe || !env_1.env.stripeWebhookSecret) {
        return res.status(503).send("Stripe webhook unavailable");
    }
    let event;
    try {
        const sig = req.headers["stripe-signature"];
        if (!sig)
            return res.status(400).send("Missing signature");
        event = stripe.webhooks.constructEvent(req.body, sig, env_1.env.stripeWebhookSecret);
    }
    catch {
        return res.status(400).send("Stripe signature verification failed");
    }
    try {
        await WebhookEvent_1.WebhookEvent.create({ provider: "stripe", externalId: event.id });
    }
    catch {
        return res.status(200).json({ received: true, duplicate: true });
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderIdStr = session.metadata?.orderId;
        if (!orderIdStr || !mongoose_1.default.isValidObjectId(orderIdStr))
            return res.status(200).json({ received: true });
        const order = await Order_1.Order.findById(orderIdStr);
        if (order &&
            (order.status === "pending_payment" || order.status === "paid")) {
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
async function clearCartForOrder(order) {
    try {
        if (order.customerId) {
            await Cart_1.Cart.deleteOne({ userId: order.customerId });
        }
        if (order.guestToken) {
            await Cart_1.Cart.deleteOne({ guestToken: order.guestToken });
        }
    }
    catch {
        /* non-fatal */
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRouter = void 0;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = require("../../middleware/asyncHandler");
const requireAuth_1 = require("../../middleware/requireAuth");
const schemas_1 = require("../../validators/schemas");
const validateBody_1 = require("../../utils/validateBody");
const hydrateCart_1 = require("../../services/hydrateCart");
const orderDraft_1 = require("../../services/orderDraft");
const stripeService_1 = require("../../services/stripeService");
const AppError_1 = require("../../utils/AppError");
const env_1 = require("../../config/env");
const pkPayments_1 = require("../../services/pkPayments");
const cryptoHash_1 = require("../../utils/cryptoHash");
exports.checkoutRouter = (0, express_1.Router)();
exports.checkoutRouter.post("/checkout/stripe-session", requireAuth_1.optionalAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const input = (0, validateBody_1.validateBody)(schemas_1.stripeCheckoutSchema, req);
    const stripe = (0, stripeService_1.getStripe)();
    if (!stripe)
        throw new AppError_1.AppError(503, "Stripe not configured");
    const { lines, subtotalUSD } = await (0, hydrateCart_1.hydrateCartLines)(req.user?.sub, input.guestToken);
    const order = await (0, orderDraft_1.createPendingOrder)(lines, subtotalUSD, {
        customerId: req.user?.sub && mongoose_1.default.isValidObjectId(req.user.sub)
            ? new mongoose_1.default.Types.ObjectId(req.user.sub)
            : undefined,
        guestToken: req.user?.sub ? undefined : input.guestToken,
    });
    const base = input.successUrl?.replace(/\/$/, "") ?? env_1.env.webPublicUrl;
    const successUrl = `${base}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = input.cancelUrl ?? `${env_1.env.webPublicUrl}/cart`;
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lines.map((l) => ({
            quantity: l.quantity,
            price_data: {
                currency: "usd",
                unit_amount: Math.round(l.unitPriceUSD * 100),
                product_data: {
                    name: `${l.title} (${l.sku})`,
                    images: l.imagePublicId && env_1.env.cloudinary.cloudName
                        ? [
                            `https://res.cloudinary.com/${env_1.env.cloudinary.cloudName}/image/upload/f_auto,q_auto,w_640/${l.imagePublicId}`,
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
}));
exports.checkoutRouter.post("/payments/:provider/initiate", requireAuth_1.optionalAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const provider = req.params.provider;
    if (!["jazzcash", "easypaisa"].includes(provider)) {
        throw new AppError_1.AppError(400, "Unknown provider");
    }
    const input = (0, validateBody_1.validateBody)(schemas_1.pkInitSchema, req);
    const { lines, subtotalUSD } = await (0, hydrateCart_1.hydrateCartLines)(req.user?.sub, input.guestToken);
    const order = await (0, orderDraft_1.createPendingOrder)(lines, subtotalUSD, {
        customerId: req.user?.sub && mongoose_1.default.isValidObjectId(req.user.sub)
            ? new mongoose_1.default.Types.ObjectId(req.user.sub)
            : undefined,
        guestToken: req.user?.sub ? undefined : input.guestToken,
    });
    const amountUsd = Math.max(subtotalUSD, 1);
    const amountPkr = Math.round(amountUsd * env_1.env.pkrPerUsd);
    if (provider === "jazzcash") {
        order.payment ??= {};
        order.payment.provider = "jazzcash";
        order.payment.status = "pending_redirect";
        await order.save();
        const fields = (0, pkPayments_1.buildJazzcashFormFields)({
            amountPkr,
            billReference: order.orderNumber,
            description: `THE SYNTRAA order ${order.orderNumber}`,
        });
        const postUrl = env_1.env.jazzcash.postUrl;
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
    const storeId = env_1.env.easypaisa.storeId;
    const txnId = cryptoRandom();
    const fields = {
        storeId,
        transactionAmount: String(amountPkr),
        merchantOrderReference: order.orderNumber,
        orderRef: order.orderNumber,
        transactionId: txnId,
        returnUrl: env_1.env.easypaisa.returnUrl || `${env_1.env.webPublicUrl}/checkout/complete`,
    };
    // Hash placeholder aligned with PSP — replace validateEasypaisa fields in production docs
    fields.secureHash = (0, cryptoHash_1.hmacSha256Hex)(env_1.env.easypaisa.hashKey || "sandbox", `${fields.orderRef}|${fields.transactionAmount}|${fields.transactionId}`);
    order.payment ??= {};
    order.payment.provider = "easypaisa";
    order.payment.txnRef = txnId;
    order.payment.status = "pending_redirect";
    await order.save();
    res.json({
        data: {
            provider: "easypaisa",
            postUrl: env_1.env.easypaisa.postUrl,
            fields,
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
        },
    });
}));
function cryptoRandom() {
    return Math.random().toString(36).slice(2, 12).toUpperCase();
}

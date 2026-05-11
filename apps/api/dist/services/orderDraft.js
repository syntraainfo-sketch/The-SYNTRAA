"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPendingOrder = createPendingOrder;
const Order_1 = require("../models/Order");
const orders_1 = require("./orders");
const mongoose_1 = __importDefault(require("mongoose"));
async function createPendingOrder(lines, subtotalUSD, opts) {
    const orderNumber = (0, orders_1.generateOrderNumber)();
    const orderLines = lines.map((l) => ({
        sku: l.sku,
        title: l.title,
        quantity: l.quantity,
        unitPriceUSD: l.unitPriceUSD,
        imagePublicId: l.imagePublicId,
        productId: new mongoose_1.default.Types.ObjectId(l.productId),
    }));
    const order = await Order_1.Order.create({
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

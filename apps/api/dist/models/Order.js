"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const lineSchema = new mongoose_1.Schema({
    sku: String,
    title: String,
    quantity: Number,
    unitPriceUSD: Number,
    imagePublicId: String,
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product" },
}, { _id: false });
const paymentSchema = new mongoose_1.Schema({
    provider: { type: String, enum: ["stripe", "jazzcash", "easypaisa"] },
    intentId: String,
    txnRef: String,
    status: String,
    paidAt: Date,
    rawPayload: mongoose_1.Schema.Types.Mixed,
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    customerEmail: String,
    guestToken: String,
    items: { type: [lineSchema], default: [] },
    subtotalUSD: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    fxDisplay: mongoose_1.Schema.Types.Mixed,
    status: {
        type: String,
        enum: [
            "pending_payment",
            "paid",
            "processing",
            "shipped",
            "cancelled",
            "refunded",
        ],
        default: "pending_payment",
    },
    payment: paymentSchema,
    shippingAddress: mongoose_1.Schema.Types.Mixed,
    idempotencyKey: { type: String, index: true, sparse: true },
    webhookEvents: [{ type: String }],
}, { timestamps: true });
exports.Order = mongoose_1.default.models.Order ?? mongoose_1.default.model("Order", orderSchema);

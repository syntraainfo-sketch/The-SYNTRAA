import mongoose, { InferSchemaType, Schema } from "mongoose";

const lineSchema = new Schema(
  {
    sku: String,
    title: String,
    quantity: Number,
    unitPriceUSD: Number,
    imagePublicId: String,
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ["stripe", "jazzcash", "easypaisa", "bank_transfer", "cod"],
    },
    intentId: String,
    txnRef: String,
    customerNote: String,
    status: String,
    paidAt: Date,
    rawPayload: Schema.Types.Mixed,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    customerEmail: String,
    guestToken: String,
    items: { type: [lineSchema], default: [] },
    subtotalUSD: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    fxDisplay: Schema.Types.Mixed,
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
    shippingAddress: Schema.Types.Mixed,
    idempotencyKey: { type: String, index: true, sparse: true },
    webhookEvents: [{ type: String }],
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };
export const Order = mongoose.models.Order ?? mongoose.model("Order", orderSchema);

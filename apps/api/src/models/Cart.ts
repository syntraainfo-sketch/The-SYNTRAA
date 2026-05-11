import mongoose, { InferSchemaType, Schema } from "mongoose";

const itemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true, index: true },
    guestToken: { type: String, sparse: true, index: true },
    items: { type: [itemSchema], default: [] },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestToken: 1 }, { unique: true, sparse: true });

export type CartDoc = InferSchemaType<typeof cartSchema> & { _id: mongoose.Types.ObjectId };
export const Cart = mongoose.models.Cart ?? mongoose.model("Cart", cartSchema);

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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    guestToken: { type: String, unique: true, sparse: true },
    items: { type: [itemSchema], default: [] },
  },
  { timestamps: true }
);

export type CartDoc = InferSchemaType<typeof cartSchema> & { _id: mongoose.Types.ObjectId };
export const Cart = mongoose.models.Cart ?? mongoose.model("Cart", cartSchema);

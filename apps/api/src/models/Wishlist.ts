import mongoose, { InferSchemaType, Schema } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    guestToken: { type: String, sparse: true, unique: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export type WishlistDoc = InferSchemaType<typeof wishlistSchema> & { _id: mongoose.Types.ObjectId };
export const Wishlist = mongoose.models.Wishlist ?? mongoose.model("Wishlist", wishlistSchema);

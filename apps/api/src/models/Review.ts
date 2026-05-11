import mongoose, { InferSchemaType, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    body: String,
    verifiedPurchase: { type: Boolean, default: false },
    moderation: {
      state: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof reviewSchema> & { _id: mongoose.Types.ObjectId };
export const Review = mongoose.models.Review ?? mongoose.model("Review", reviewSchema);

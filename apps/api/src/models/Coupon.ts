import mongoose, { InferSchemaType, Schema } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    scope: { type: String, enum: ["global", "category", "product"], default: "global" },
    appliesToIds: [{ type: Schema.Types.ObjectId }],
    maxRedemptions: { type: Number },
    redeemedCount: { type: Number, default: 0 },
    expiresAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type CouponDoc = InferSchemaType<typeof couponSchema> & { _id: mongoose.Types.ObjectId };
export const Coupon = mongoose.models.Coupon ?? mongoose.model("Coupon", couponSchema);

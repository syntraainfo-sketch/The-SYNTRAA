import mongoose, { InferSchemaType, Schema } from "mongoose";

/** Singleton document keyed by `_id` = "global" */

const settingsSchema = new Schema(
  {
    _id: { type: String, default: "global" },
    storefrontName: String,
    announcement: String,
    fxMode: {
      type: String,
      enum: ["usd_only", "display_secondary"],
      default: "usd_only",
    },
    secondaryCurrencyCode: String,
    homeSections: { type: [{ type: Schema.Types.Mixed }], default: [] },
    paymentFlags: {
      stripe: { type: Boolean, default: true },
      jazzcash: { type: Boolean, default: true },
      easypaisa: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export type SettingsDoc = InferSchemaType<typeof settingsSchema> & { _id: string };
export const Settings =
  mongoose.models.Settings ?? mongoose.model("Settings", settingsSchema);

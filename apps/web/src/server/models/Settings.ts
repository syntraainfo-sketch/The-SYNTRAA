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
    bankAccount: {
      bankName: { type: String, default: "Meezan Bank" },
      accountTitle: { type: String, default: "THE SYNTRAA" },
      accountNumber: { type: String, default: "" },
      iban: { type: String, default: "" },
      branch: { type: String, default: "" },
      instructions: {
        type: String,
        default: "Transfer total amount and add your order number in the reference.",
      },
    },
    easypaisaWallet: { type: String, default: "" },
    paymentFlags: {
      stripe: { type: Boolean, default: false },
      jazzcash: { type: Boolean, default: false },
      easypaisa: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export type SettingsDoc = InferSchemaType<typeof settingsSchema> & { _id: string };
export const Settings =
  mongoose.models.Settings ?? mongoose.model("Settings", settingsSchema);

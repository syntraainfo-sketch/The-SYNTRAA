import mongoose, { Schema } from "mongoose";

const webhookEventSchema = new Schema(
  {
    provider: { type: String, required: true, index: true },
    externalId: { type: String, required: true },
    handledAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

webhookEventSchema.index({ provider: 1, externalId: 1 }, { unique: true });

export const WebhookEvent =
  mongoose.models.WebhookEvent ?? mongoose.model("WebhookEvent", webhookEventSchema);

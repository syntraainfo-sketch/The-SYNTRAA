import mongoose, { InferSchemaType, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    heroImagePublicId: { type: String },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: mongoose.Types.ObjectId };
export const Category = mongoose.models.Category ?? mongoose.model("Category", categorySchema);

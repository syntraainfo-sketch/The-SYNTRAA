import mongoose, { InferSchemaType, Schema } from "mongoose";

const sectionSchema = new Schema(
  {
    type: { type: String, required: true },
    data: Schema.Types.Mixed,
  },
  { _id: false }
);

const cmsPageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    seoTitle: String,
    seoDescription: String,
    body: String,
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

export type CMSPageDoc = InferSchemaType<typeof cmsPageSchema> & { _id: mongoose.Types.ObjectId };
export const CMSPage = mongoose.models.CMSPage ?? mongoose.model("CMSPage", cmsPageSchema);

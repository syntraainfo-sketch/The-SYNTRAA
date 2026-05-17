import mongoose, { InferSchemaType, Schema } from "mongoose";

const galleryImageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    focal: String,
  },
  { _id: false }
);

const variantSchema = new Schema(
  {
    sku: { type: String, required: true },
    label: String,
    size: String,
    color: String,
    priceUSD: { type: Number, required: true },
    compareAtUSD: Number,
    inventory: { type: Number, default: 0 },
  },
  { _id: false }
);

const seoSchema = new Schema(
  {
    title: String,
    description: String,
    ogImagePublicId: String,
    canonicalPath: String,
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    descriptionShort: String,
    richDescription: String,
    ingredients: String,
    howToUse: String,
    benefits: String,
    sustainability: String,
    highlights: { type: [String], default: [] },
    gallery: { type: [galleryImageSchema], default: [] },
    variants: { type: [variantSchema], required: true, default: [] },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    featured: { type: Boolean, default: false },
    seo: seoSchema,
    aggregateRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };
export const Product = mongoose.models.Product ?? mongoose.model("Product", productSchema);

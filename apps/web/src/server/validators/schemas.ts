import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const galleryImage = z.object({
  publicId: z.string(),
  alt: z.string().optional(),
  focal: z.string().optional(),
});

const variantSchema = z.object({
  sku: z.string(),
  label: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  priceUSD: z.number().nonnegative(),
  compareAtUSD: z.number().optional(),
  inventory: z.number().int().nonnegative(),
});

export const productCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  descriptionShort: z.string().optional(),
  richDescription: z.string().optional(),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  benefits: z.string().optional(),
  sustainability: z.string().optional(),
  highlights: z.array(z.string()).optional().default([]),
  gallery: z.array(galleryImage).default([]),
  variants: z.array(variantSchema).min(1),
  categories: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      ogImagePublicId: z.string().optional(),
      canonicalPath: z.string().optional(),
    })
    .optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const cartItemSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  quantity: z.number().int().positive(),
});

export const cartUpsertSchema = cartItemSchema.extend({
  guestToken: z.string().optional(),
});

export const cartRemoveSchema = z
  .object({
    productId: z.string().optional(),
    sku: z.string().optional(),
    guestToken: z.string().optional(),
    clearAll: z.literal(true).optional(),
  })
  .refine((data) => data.clearAll === true || (Boolean(data.productId) && Boolean(data.sku)), {
    message: "productId and sku required unless clearAll is true",
  });

export const stripeCheckoutSchema = z.object({
  guestToken: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const pkInitSchema = z.object({
  guestToken: z.string().optional(),
});

export const manualCheckoutSchema = z.object({
  guestToken: z.string().optional(),
  customerName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(5),
  bankReference: z.string().optional(),
  paymentScreenshotPublicId: z.string().max(300).optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  order: z.number().optional(),
  heroImagePublicId: z.string().optional(),
});

export const orderStatusPatchSchema = z.object({
  status: z.enum([
    "pending_payment",
    "paid",
    "processing",
    "shipped",
    "cancelled",
    "refunded",
  ]),
});

export const cmsPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  body: z.string().optional(),
});

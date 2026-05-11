"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsPageSchema = exports.orderStatusPatchSchema = exports.categoryCreateSchema = exports.pkInitSchema = exports.stripeCheckoutSchema = exports.cartRemoveSchema = exports.cartUpsertSchema = exports.cartItemSchema = exports.productUpdateSchema = exports.productCreateSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const galleryImage = zod_1.z.object({
    publicId: zod_1.z.string(),
    alt: zod_1.z.string().optional(),
    focal: zod_1.z.string().optional(),
});
const variantSchema = zod_1.z.object({
    sku: zod_1.z.string(),
    label: zod_1.z.string().optional(),
    size: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    priceUSD: zod_1.z.number().nonnegative(),
    compareAtUSD: zod_1.z.number().optional(),
    inventory: zod_1.z.number().int().nonnegative(),
});
exports.productCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    descriptionShort: zod_1.z.string().optional(),
    richDescription: zod_1.z.string().optional(),
    gallery: zod_1.z.array(galleryImage).default([]),
    variants: zod_1.z.array(variantSchema).min(1),
    categories: zod_1.z.array(zod_1.z.string()).default([]),
    featured: zod_1.z.boolean().optional(),
    seo: zod_1.z
        .object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        ogImagePublicId: zod_1.z.string().optional(),
        canonicalPath: zod_1.z.string().optional(),
    })
        .optional(),
});
exports.productUpdateSchema = exports.productCreateSchema.partial();
exports.cartItemSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    sku: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive(),
});
exports.cartUpsertSchema = exports.cartItemSchema.extend({
    guestToken: zod_1.z.string().optional(),
});
exports.cartRemoveSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    sku: zod_1.z.string(),
    guestToken: zod_1.z.string().optional(),
});
exports.stripeCheckoutSchema = zod_1.z.object({
    guestToken: zod_1.z.string().optional(),
    successUrl: zod_1.z.string().url().optional(),
    cancelUrl: zod_1.z.string().url().optional(),
});
exports.pkInitSchema = zod_1.z.object({
    guestToken: zod_1.z.string().optional(),
});
exports.categoryCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    parentId: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
    heroImagePublicId: zod_1.z.string().optional(),
});
exports.orderStatusPatchSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "cancelled",
        "refunded",
    ]),
});
exports.cmsPageSchema = zod_1.z.object({
    slug: zod_1.z.string(),
    title: zod_1.z.string(),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
});

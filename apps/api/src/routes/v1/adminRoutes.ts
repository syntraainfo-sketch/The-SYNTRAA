import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/requireAuth";
import { requireAdmin } from "../../middleware/requireAdmin";
import {
  categoryCreateSchema,
  cmsPageSchema,
  orderStatusPatchSchema,
  productCreateSchema,
  productUpdateSchema,
} from "../../validators/schemas";
import { validateBody } from "../../utils/validateBody";
import { Product } from "../../models/Product";
import { Category } from "../../models/Category";
import { Order } from "../../models/Order";
import { User } from "../../models/User";
import { CMSPage } from "../../models/CMSPage";
import { Settings } from "../../models/Settings";
import { productJSON, categoryJSON } from "./serialize";
import { AppError } from "../../utils/AppError";
import { signUploadParams } from "../../services/cloudinarySign";
import { env } from "../../config/env";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/admin/analytics/overview",
  asyncHandler(async (_req, res) => {
    const [rev] = await Order.aggregate<{
      revenue: number;
      orders: number;
    }>([
      {
        $match: {
          status: { $in: ["paid", "processing", "shipped"] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$subtotalUSD" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const pendingPaymentOrders = await Order.countDocuments({
      status: "pending_payment",
    });
    res.json({
      data: {
        revenue: rev?.revenue ?? 0,
        fulfilledOrders: rev?.orders ?? 0,
        pendingPaymentOrders,
        lowStockSkus: 0,
      },
    });
  })
);

adminRouter.get(
  "/admin/products",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? "50") || 50, 200);
    const items = await Product.find({}).sort({ updatedAt: -1 }).limit(limit);
    res.json({ data: items.map((p) => productJSON(p)) });
  })
);

adminRouter.post(
  "/admin/products",
  asyncHandler(async (req, res) => {
    const body = validateBody(productCreateSchema, req);
    const cats = await Category.find({ _id: { $in: body.categories } });
    const p = await Product.create({
      ...body,
      categories: cats.map((c) => c._id),
    });
    res.status(201).json({ data: productJSON(p) });
  })
);

adminRouter.patch(
  "/admin/products/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(400, "Bad id");
    const body = validateBody(productUpdateSchema, req);
    const update: Record<string, unknown> = { ...body };
    if (body.categories) {
      const cats = await Category.find({ _id: { $in: body.categories } });
      update.categories = cats.map((c) => c._id);
    }
    const p = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!p) throw new AppError(404, "Not found");
    res.json({ data: productJSON(p) });
  })
);

adminRouter.delete(
  "/admin/products/:id",
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  })
);

adminRouter.get(
  "/admin/categories",
  asyncHandler(async (_req, res) => {
    const cats = await Category.find({}).sort({ order: 1 });
    res.json({ data: cats.map((c) => categoryJSON(c)) });
  })
);

adminRouter.post(
  "/admin/categories",
  asyncHandler(async (req, res) => {
    const body = validateBody(categoryCreateSchema, req);
    const c = await Category.create({
      name: body.name,
      slug: body.slug,
      parentId:
        body.parentId && mongoose.isValidObjectId(body.parentId)
          ? new mongoose.Types.ObjectId(body.parentId)
          : undefined,
      order: body.order,
      heroImagePublicId: body.heroImagePublicId,
    });
    res.status(201).json({ data: categoryJSON(c) });
  })
);

adminRouter.get(
  "/admin/orders",
  asyncHandler(async (_req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200);
    res.json({ data: orders });
  })
);

adminRouter.patch(
  "/admin/orders/:id/status",
  asyncHandler(async (req, res) => {
    const body = validateBody(orderStatusPatchSchema, req);
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: body.status },
      { new: true }
    );
    if (!order) throw new AppError(404, "Not found");
    res.json({ data: order });
  })
);

adminRouter.get(
  "/admin/customers",
  asyncHandler(async (_req, res) => {
    const customers = await User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .limit(500)
      .select("email name createdAt");
    res.json({ data: customers });
  })
);

adminRouter.get(
  "/admin/cms/pages",
  asyncHandler(async (_req, res) => {
    const pages = await CMSPage.find({}).sort({ slug: 1 });
    res.json({ data: pages });
  })
);

adminRouter.put(
  "/admin/cms/pages/:slug",
  asyncHandler(async (req, res) => {
    const body = validateBody(cmsPageSchema, req);
    const page = await CMSPage.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: body },
      { upsert: true, new: true }
    );
    res.json({ data: page });
  })
);

adminRouter.get(
  "/admin/settings",
  asyncHandler(async (_req, res) => {
    let s = await Settings.findById("global");
    if (!s) {
      s = await Settings.create({ _id: "global" });
    }
    res.json({ data: s });
  })
);

adminRouter.patch(
  "/admin/settings",
  asyncHandler(async (req, res) => {
    const s = await Settings.findOneAndUpdate(
      { _id: "global" },
      { $set: req.body },
      { upsert: true, new: true }
    );
    res.json({ data: s });
  })
);

adminRouter.post(
  "/admin/media/sign",
  asyncHandler(async (req, res) => {
    if (!env.cloudinary.apiSecret) throw new AppError(503, "Cloudinary not configured");
    const folder =
      typeof req.body?.folder === "string" ? req.body.folder : env.cloudinary.folder;
    const signed = signUploadParams({ folder: String(folder) });
    res.json({
      data: {
        ...signed,
        cloudName: env.cloudinary.cloudName,
      },
    });
  })
);

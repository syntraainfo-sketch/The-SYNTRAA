import { Router } from "express";
import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { asyncHandler } from "../../middleware/asyncHandler";
import { categoryJSON, productJSON } from "./serialize";

export const catalogRouter = Router();

catalogRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const featured = req.query.featured === "true";
    const slug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
    const limit = Math.min(Number(req.query.limit ?? "24") || 24, 72);
    const skip = Number(req.query.skip ?? "0") || 0;
    const query: Record<string, unknown> = {};
    if (featured) query.featured = true;
    if (slug) {
      const cat = await Category.findOne({ slug });
      if (cat) query.categories = cat._id;
    }
    const [items, total] = await Promise.all([
      Product.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(false),
      Product.countDocuments(query),
    ]);
    res.json({
      data: items.map((p) => productJSON(p)),
      meta: { total, skip, limit },
    });
  })
);

catalogRouter.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const p = await Product.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ data: productJSON(p) });
  })
);

catalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const cats = await Category.find({}).sort({ order: 1, name: 1 });
    res.json({ data: cats.map((c) => categoryJSON(c)) });
  })
);

catalogRouter.get(
  "/categories/:slug",
  asyncHandler(async (req, res) => {
    const c = await Category.findOne({ slug: req.params.slug });
    if (!c) return res.status(404).json({ error: { message: "Not found" } });
    const products = await Product.find({ categories: c._id }).limit(48);
    res.json({
      data: {
        category: categoryJSON(c),
        products: products.map((p) => productJSON(p)),
      },
    });
  })
);

catalogRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) return res.json({ data: [], meta: { total: 0 } });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const items = await Product.find({
      $or: [{ title: rx }, { descriptionShort: rx }, { slug: rx }],
    }).limit(48);
    res.json({ data: items.map((p) => productJSON(p)), meta: { total: items.length } });
  })
);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogRouter = void 0;
const express_1 = require("express");
const Category_1 = require("../../models/Category");
const Product_1 = require("../../models/Product");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const serialize_1 = require("./serialize");
exports.catalogRouter = (0, express_1.Router)();
exports.catalogRouter.get("/products", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const featured = req.query.featured === "true";
    const slug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
    const limit = Math.min(Number(req.query.limit ?? "24") || 24, 72);
    const skip = Number(req.query.skip ?? "0") || 0;
    const query = {};
    if (featured)
        query.featured = true;
    if (slug) {
        const cat = await Category_1.Category.findOne({ slug });
        if (cat)
            query.categories = cat._id;
    }
    const [items, total] = await Promise.all([
        Product_1.Product.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(false),
        Product_1.Product.countDocuments(query),
    ]);
    res.json({
        data: items.map((p) => (0, serialize_1.productJSON)(p)),
        meta: { total, skip, limit },
    });
}));
exports.catalogRouter.get("/products/:slug", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const p = await Product_1.Product.findOne({ slug: req.params.slug });
    if (!p)
        return res.status(404).json({ error: { message: "Not found" } });
    res.json({ data: (0, serialize_1.productJSON)(p) });
}));
exports.catalogRouter.get("/categories", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const cats = await Category_1.Category.find({}).sort({ order: 1, name: 1 });
    res.json({ data: cats.map((c) => (0, serialize_1.categoryJSON)(c)) });
}));
exports.catalogRouter.get("/categories/:slug", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const c = await Category_1.Category.findOne({ slug: req.params.slug });
    if (!c)
        return res.status(404).json({ error: { message: "Not found" } });
    const products = await Product_1.Product.find({ categories: c._id }).limit(48);
    res.json({
        data: {
            category: (0, serialize_1.categoryJSON)(c),
            products: products.map((p) => (0, serialize_1.productJSON)(p)),
        },
    });
}));
exports.catalogRouter.get("/search", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q)
        return res.json({ data: [], meta: { total: 0 } });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const items = await Product_1.Product.find({
        $or: [{ title: rx }, { descriptionShort: rx }, { slug: rx }],
    }).limit(48);
    res.json({ data: items.map((p) => (0, serialize_1.productJSON)(p)), meta: { total: items.length } });
}));

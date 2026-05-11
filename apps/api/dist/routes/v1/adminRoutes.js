"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = require("../../middleware/asyncHandler");
const requireAuth_1 = require("../../middleware/requireAuth");
const requireAdmin_1 = require("../../middleware/requireAdmin");
const schemas_1 = require("../../validators/schemas");
const validateBody_1 = require("../../utils/validateBody");
const Product_1 = require("../../models/Product");
const Category_1 = require("../../models/Category");
const Order_1 = require("../../models/Order");
const User_1 = require("../../models/User");
const CMSPage_1 = require("../../models/CMSPage");
const Settings_1 = require("../../models/Settings");
const serialize_1 = require("./serialize");
const AppError_1 = require("../../utils/AppError");
const cloudinarySign_1 = require("../../services/cloudinarySign");
const env_1 = require("../../config/env");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(requireAuth_1.requireAuth, requireAdmin_1.requireAdmin);
exports.adminRouter.get("/admin/analytics/overview", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [rev] = await Order_1.Order.aggregate([
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
    const pendingPaymentOrders = await Order_1.Order.countDocuments({
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
}));
exports.adminRouter.get("/admin/products", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? "50") || 50, 200);
    const items = await Product_1.Product.find({}).sort({ updatedAt: -1 }).limit(limit);
    res.json({ data: items.map((p) => (0, serialize_1.productJSON)(p)) });
}));
exports.adminRouter.post("/admin/products", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.productCreateSchema, req);
    const cats = await Category_1.Category.find({ _id: { $in: body.categories } });
    const p = await Product_1.Product.create({
        ...body,
        categories: cats.map((c) => c._id),
    });
    res.status(201).json({ data: (0, serialize_1.productJSON)(p) });
}));
exports.adminRouter.patch("/admin/products/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!mongoose_1.default.isValidObjectId(req.params.id))
        throw new AppError_1.AppError(400, "Bad id");
    const body = (0, validateBody_1.validateBody)(schemas_1.productUpdateSchema, req);
    const update = { ...body };
    if (body.categories) {
        const cats = await Category_1.Category.find({ _id: { $in: body.categories } });
        update.categories = cats.map((c) => c._id);
    }
    const p = await Product_1.Product.findByIdAndUpdate(req.params.id, update, {
        new: true,
    });
    if (!p)
        throw new AppError_1.AppError(404, "Not found");
    res.json({ data: (0, serialize_1.productJSON)(p) });
}));
exports.adminRouter.delete("/admin/products/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await Product_1.Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
}));
exports.adminRouter.get("/admin/categories", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const cats = await Category_1.Category.find({}).sort({ order: 1 });
    res.json({ data: cats.map((c) => (0, serialize_1.categoryJSON)(c)) });
}));
exports.adminRouter.post("/admin/categories", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.categoryCreateSchema, req);
    const c = await Category_1.Category.create({
        name: body.name,
        slug: body.slug,
        parentId: body.parentId && mongoose_1.default.isValidObjectId(body.parentId)
            ? new mongoose_1.default.Types.ObjectId(body.parentId)
            : undefined,
        order: body.order,
        heroImagePublicId: body.heroImagePublicId,
    });
    res.status(201).json({ data: (0, serialize_1.categoryJSON)(c) });
}));
exports.adminRouter.get("/admin/orders", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const orders = await Order_1.Order.find({}).sort({ createdAt: -1 }).limit(200);
    res.json({ data: orders });
}));
exports.adminRouter.patch("/admin/orders/:id/status", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.orderStatusPatchSchema, req);
    const order = await Order_1.Order.findByIdAndUpdate(req.params.id, { status: body.status }, { new: true });
    if (!order)
        throw new AppError_1.AppError(404, "Not found");
    res.json({ data: order });
}));
exports.adminRouter.get("/admin/customers", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const customers = await User_1.User.find({ role: "customer" })
        .sort({ createdAt: -1 })
        .limit(500)
        .select("email name createdAt");
    res.json({ data: customers });
}));
exports.adminRouter.get("/admin/cms/pages", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const pages = await CMSPage_1.CMSPage.find({}).sort({ slug: 1 });
    res.json({ data: pages });
}));
exports.adminRouter.put("/admin/cms/pages/:slug", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.cmsPageSchema, req);
    const page = await CMSPage_1.CMSPage.findOneAndUpdate({ slug: req.params.slug }, { $set: body }, { upsert: true, new: true });
    res.json({ data: page });
}));
exports.adminRouter.get("/admin/settings", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    let s = await Settings_1.Settings.findById("global");
    if (!s) {
        s = await Settings_1.Settings.create({ _id: "global" });
    }
    res.json({ data: s });
}));
exports.adminRouter.patch("/admin/settings", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const s = await Settings_1.Settings.findOneAndUpdate({ _id: "global" }, { $set: req.body }, { upsert: true, new: true });
    res.json({ data: s });
}));
exports.adminRouter.post("/admin/media/sign", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!env_1.env.cloudinary.apiSecret)
        throw new AppError_1.AppError(503, "Cloudinary not configured");
    const folder = typeof req.body?.folder === "string" ? req.body.folder : env_1.env.cloudinary.folder;
    const signed = (0, cloudinarySign_1.signUploadParams)({ folder: String(folder) });
    res.json({
        data: {
            ...signed,
            cloudName: env_1.env.cloudinary.cloudName,
        },
    });
}));

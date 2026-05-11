"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const Cart_1 = require("../../models/Cart");
const Product_1 = require("../../models/Product");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const requireAuth_1 = require("../../middleware/requireAuth");
const schemas_1 = require("../../validators/schemas");
const validateBody_1 = require("../../utils/validateBody");
const cartContext_1 = require("../../services/cartContext");
const AppError_1 = require("../../utils/AppError");
exports.cartRouter = (0, express_1.Router)();
exports.cartRouter.use(requireAuth_1.optionalAuth);
exports.cartRouter.get("/cart", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const guest = typeof req.query.guestToken === "string" ? req.query.guestToken : undefined;
    const ids = (0, cartContext_1.resolveCartIds)(req, guest);
    const q = (0, cartContext_1.cartQueryFilter)(ids);
    if (!ids.userId && !ids.guestToken) {
        return res.json({ data: { items: [] }, meta: {} });
    }
    const cart = q ? await Cart_1.Cart.findOne(q) : null;
    res.json({
        data: cart ? cart.toJSON() : { items: [] },
        meta: {},
    });
}));
exports.cartRouter.post("/cart/items", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.cartUpsertSchema, req);
    let guestToken = body.guestToken;
    const userIdStr = typeof req.user?.sub === "string" ? req.user.sub : undefined;
    if (!userIdStr && !guestToken) {
        guestToken = crypto_1.default.randomUUID();
        await Cart_1.Cart.create({ guestToken, items: [] });
    }
    const filter = (0, cartContext_1.cartQueryFilter)(userIdStr ? { userId: userIdStr } : { guestToken: guestToken }) ?? {};
    const productIdStr = body.productId;
    const product = await Product_1.Product.findById(productIdStr);
    if (!product)
        throw new AppError_1.AppError(404, "Product not found");
    const variant = product.variants.find((v) => v.sku === body.sku);
    if (!variant)
        throw new AppError_1.AppError(400, "Invalid variant");
    const qty = Math.min(variant.inventory, body.quantity);
    if (qty < 1)
        throw new AppError_1.AppError(400, "Insufficient stock");
    let cart = await Cart_1.Cart.findOne(filter);
    if (!cart) {
        cart = await Cart_1.Cart.create({
            ...(userIdStr
                ? { userId: new mongoose_1.default.Types.ObjectId(userIdStr) }
                : { guestToken }),
            items: [],
        });
    }
    const idx = cart.items.findIndex((i) => String(i.productId) === productIdStr && i.sku === body.sku);
    if (idx >= 0)
        cart.items[idx].quantity = qty;
    else {
        cart.items.push({
            productId: new mongoose_1.default.Types.ObjectId(productIdStr),
            sku: body.sku,
            quantity: qty,
        });
    }
    await cart.save();
    res.status(200).json({
        data: cart.toJSON(),
        meta: !userIdStr && guestToken ? { guestToken } : {},
    });
}));
exports.cartRouter.delete("/cart/items", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(schemas_1.cartRemoveSchema, req);
    const ids = (0, cartContext_1.resolveCartIds)(req, body.guestToken);
    const q = (0, cartContext_1.cartQueryFilter)(ids);
    if (!q)
        throw new AppError_1.AppError(400, "Identify cart");
    const cart = await Cart_1.Cart.findOne(q);
    if (!cart)
        return res.status(404).json({ error: { message: "Cart not found" } });
    cart.items = cart.items.filter((i) => !(String(i.productId) === body.productId && i.sku === body.sku));
    await cart.save();
    res.json({ data: cart.toJSON() });
}));

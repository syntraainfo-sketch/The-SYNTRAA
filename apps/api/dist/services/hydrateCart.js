"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hydrateCartLines = hydrateCartLines;
const mongoose_1 = __importDefault(require("mongoose"));
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const AppError_1 = require("../utils/AppError");
async function hydrateCartLines(userId, guestToken) {
    let cart = null;
    if (userId && mongoose_1.default.isValidObjectId(userId)) {
        cart = await Cart_1.Cart.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
    }
    else if (guestToken)
        cart = await Cart_1.Cart.findOne({ guestToken });
    if (!cart || !cart.items.length)
        throw new AppError_1.AppError(400, "Cart is empty");
    let subtotalUSD = 0;
    const lines = [];
    for (const item of cart.items) {
        const product = await Product_1.Product.findById(item.productId);
        if (!product)
            continue;
        const variant = product.variants.find((v) => v.sku === item.sku);
        if (!variant || variant.inventory < item.quantity)
            throw new AppError_1.AppError(400, `SKU ${item.sku} unavailable`);
        const thumb = product.gallery?.[0]?.publicId;
        lines.push({
            productId: product._id.toString(),
            sku: variant.sku,
            quantity: item.quantity,
            title: product.title,
            unitPriceUSD: variant.priceUSD,
            imagePublicId: thumb,
        });
        subtotalUSD += variant.priceUSD * item.quantity;
    }
    if (!lines.length)
        throw new AppError_1.AppError(400, "Nothing to checkout");
    return { lines, subtotalUSD };
}

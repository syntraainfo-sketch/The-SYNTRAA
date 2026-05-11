import crypto from "crypto";
import mongoose from "mongoose";
import { Router } from "express";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { asyncHandler } from "../../middleware/asyncHandler";
import { optionalAuth } from "../../middleware/requireAuth";
import { cartRemoveSchema, cartUpsertSchema } from "../../validators/schemas";
import { validateBody } from "../../utils/validateBody";
import { cartQueryFilter, resolveCartIds } from "../../services/cartContext";
import { AppError } from "../../utils/AppError";

export const cartRouter = Router();

cartRouter.use(optionalAuth);

cartRouter.get(
  "/cart",
  asyncHandler(async (req, res) => {
    const guest =
      typeof req.query.guestToken === "string" ? req.query.guestToken : undefined;
    const ids = resolveCartIds(req, guest);
    const q = cartQueryFilter(ids);
    if (!ids.userId && !ids.guestToken) {
      return res.json({ data: { items: [] }, meta: {} });
    }
    const cart = q ? await Cart.findOne(q) : null;
    res.json({
      data: cart ? cart.toJSON() : { items: [] },
      meta: {},
    });
  })
);

cartRouter.post(
  "/cart/items",
  asyncHandler(async (req, res) => {
    const body = validateBody(cartUpsertSchema, req);
    let guestToken = body.guestToken;
    const userIdStr = typeof req.user?.sub === "string" ? req.user.sub : undefined;

    if (!userIdStr && !guestToken) {
      guestToken = crypto.randomUUID();
      await Cart.create({ guestToken, items: [] });
    }

    const filter =
      cartQueryFilter(
        userIdStr ? { userId: userIdStr } : { guestToken: guestToken as string }
      ) ?? {};

    const productIdStr = body.productId;
    const product = await Product.findById(productIdStr);
    if (!product) throw new AppError(404, "Product not found");
    const variant = product.variants.find(
      (v: { sku: string; inventory: number }) => v.sku === body.sku
    );
    if (!variant) throw new AppError(400, "Invalid variant");
    const qty = Math.min(variant.inventory, body.quantity);
    if (qty < 1) throw new AppError(400, "Insufficient stock");

    let cart = await Cart.findOne(filter);
    if (!cart) {
      cart = await Cart.create({
        ...(userIdStr
          ? { userId: new mongoose.Types.ObjectId(userIdStr) }
          : { guestToken }),
        items: [],
      });
    }

    const idx = cart.items.findIndex(
      (i: { productId: mongoose.Types.ObjectId; sku: string }) =>
        String(i.productId) === productIdStr && i.sku === body.sku
    );

    if (idx >= 0) cart.items[idx].quantity = qty;
    else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productIdStr),
        sku: body.sku,
        quantity: qty,
      });
    }

    await cart.save();
    res.status(200).json({
      data: cart.toJSON(),
      meta: !userIdStr && guestToken ? { guestToken } : {},
    });
  })
);

cartRouter.delete(
  "/cart/items",
  asyncHandler(async (req, res) => {
    const body = validateBody(cartRemoveSchema, req);
    const ids = resolveCartIds(req, body.guestToken);
    const q = cartQueryFilter(ids);
    if (!q) throw new AppError(400, "Identify cart");

    const cart = await Cart.findOne(q);
    if (!cart) return res.status(404).json({ error: { message: "Cart not found" } });

    cart.items = cart.items.filter(
      (i: { productId: mongoose.Types.ObjectId; sku: string }) =>
        !(String(i.productId) === body.productId && i.sku === body.sku)
    );
    await cart.save();
    res.json({ data: cart.toJSON() });
  })
);

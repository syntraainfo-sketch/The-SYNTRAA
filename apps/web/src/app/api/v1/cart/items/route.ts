import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { Cart } from "@/server/models/Cart";
import { Product } from "@/server/models/Product";
import { cartQueryFilter, resolveCartIds } from "@/server/services/cartContext";
import { enrichCart } from "@/server/services/cartEnrich";
import { cartRemoveSchema, cartUpsertSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { AppError } from "@/server/utils/AppError";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const body = validateBody(cartUpsertSchema, await req.json());
    let guestToken = body.guestToken;
    const userIdStr = typeof user?.sub === "string" ? user.sub : undefined;

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
    return NextResponse.json({
      data: cart.toJSON(),
      meta: !userIdStr && guestToken ? { guestToken } : {},
    });
  });
}

export async function DELETE(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const body = validateBody(cartRemoveSchema, await req.json());
    const ids = resolveCartIds(user, body.guestToken);
    const q = cartQueryFilter(ids);
    if (!q) throw new AppError(400, "Identify cart");

    if (body.clearAll) {
      const cart = await Cart.findOneAndUpdate(q, { $set: { items: [] } }, { new: true });
      if (!cart) {
        return NextResponse.json(
          { error: { message: "Cart not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: await enrichCart(cart) });
    }

    const productId = body.productId as string;
    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError(400, "Invalid product id");
    }

    const productOid = new mongoose.Types.ObjectId(productId);
    const cart = await Cart.findOneAndUpdate(
      q,
      { $pull: { items: { productId: productOid, sku: body.sku } } },
      { new: true }
    );
    if (!cart) {
      return NextResponse.json(
        { error: { message: "Cart not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: await enrichCart(cart) });
  });
}

import mongoose from "mongoose";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { AppError } from "../utils/AppError";

export interface HydratedCartLine {
  productId: string;
  sku: string;
  quantity: number;
  title: string;
  unitPriceUSD: number;
  imagePublicId?: string;
}

export async function hydrateCartLines(
  userId?: string,
  guestToken?: string
): Promise<{ lines: HydratedCartLine[]; subtotalUSD: number }> {
  let cart = null;
  if (userId && mongoose.isValidObjectId(userId)) {
    cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  } else if (guestToken) cart = await Cart.findOne({ guestToken });
  if (!cart || !cart.items.length) throw new AppError(400, "Cart is empty");
  let subtotalUSD = 0;
  const lines: HydratedCartLine[] = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const variant = product.variants.find(
      (v: { sku: string; inventory: number; priceUSD: number }) =>
        v.sku === item.sku
    );
    if (!variant || variant.inventory < item.quantity)
      throw new AppError(400, `SKU ${item.sku} unavailable`);
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
  if (!lines.length) throw new AppError(400, "Nothing to checkout");
  return { lines, subtotalUSD };
}

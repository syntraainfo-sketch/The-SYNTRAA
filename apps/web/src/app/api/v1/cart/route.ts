import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { Cart } from "@/server/models/Cart";
import { Product } from "@/server/models/Product";
import { cartQueryFilter, resolveCartIds } from "@/server/services/cartContext";

export const runtime = "nodejs";

async function enrichCart(cart: { toJSON: () => { items?: Array<{ productId: unknown; sku: string; quantity: number }> } }) {
  const json = cart.toJSON();
  const items = json.items ?? [];
  const productIds = [...new Set(items.map((item) => String(item.productId)))];
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));

  return {
    ...json,
    items: items.map((item) => {
      const product = byId.get(String(item.productId));
      const variant = product?.variants?.find((v: { sku: string }) => v.sku === item.sku);
      return {
        ...item,
        title: product?.title,
        slug: product?.slug,
        imagePublicId: product?.gallery?.[0]?.publicId,
        variantLabel: variant?.size ?? variant?.label,
        priceUSD: variant?.priceUSD,
      };
    }),
  };
}

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const { searchParams } = new URL(req.url);
    const guest = searchParams.get("guestToken") ?? undefined;
    const ids = resolveCartIds(user, guest);
    const q = cartQueryFilter(ids);
    if (!ids.userId && !ids.guestToken) {
      return NextResponse.json({ data: { items: [] }, meta: {} });
    }
    const cart = q ? await Cart.findOne(q) : null;
    return NextResponse.json({
      data: cart ? await enrichCart(cart) : { items: [] },
      meta: {},
    });
  });
}

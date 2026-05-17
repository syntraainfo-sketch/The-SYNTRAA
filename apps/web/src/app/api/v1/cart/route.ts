import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { Cart } from "@/server/models/Cart";
import { cartQueryFilter, resolveCartIds } from "@/server/services/cartContext";
import { enrichCart } from "@/server/services/cartEnrich";

export const runtime = "nodejs";

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

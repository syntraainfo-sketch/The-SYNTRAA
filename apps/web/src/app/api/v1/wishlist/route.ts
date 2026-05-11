import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { Wishlist } from "@/server/models/Wishlist";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const { searchParams } = new URL(req.url);
    const guest = searchParams.get("guestToken") ?? undefined;
    let list = null as InstanceType<typeof Wishlist> | null;
    if (user?.sub) {
      list = await Wishlist.findOne({
        userId: new mongoose.Types.ObjectId(user.sub),
      });
    } else if (guest) list = await Wishlist.findOne({ guestToken: guest });

    const ids =
      list?.productIds?.map((id: mongoose.Types.ObjectId) => id.toString()) ??
      [];
    return NextResponse.json({ data: { productIds: ids } });
  });
}

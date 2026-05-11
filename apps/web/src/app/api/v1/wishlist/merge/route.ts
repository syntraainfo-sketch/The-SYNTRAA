import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser } from "@/server/auth/headers";
import { Wishlist } from "@/server/models/Wishlist";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    const json = (await req.json()) as { guestToken?: string };
    const guest =
      typeof json?.guestToken === "string" ? json.guestToken : undefined;
    if (!guest) return NextResponse.json({ data: { ok: true } });
    const guestList = await Wishlist.findOne({ guestToken: guest });
    const userList = await Wishlist.findOne({
      userId: new mongoose.Types.ObjectId(user.sub),
    });
    const merged = new Set<string>(
      [...(guestList?.productIds ?? []), ...(userList?.productIds ?? [])].map(
        (x: mongoose.Types.ObjectId) => x.toString()
      )
    );
    await Wishlist.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(user.sub) },
      { $set: { productIds: [...merged].map((id) => new mongoose.Types.ObjectId(id)) } },
      { upsert: true, new: true }
    );
    await Wishlist.deleteOne({ guestToken: guest });
    return NextResponse.json({ data: { ok: true } });
  });
}

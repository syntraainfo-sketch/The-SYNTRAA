import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { Wishlist } from "@/server/models/Wishlist";
import { validateBody } from "@/server/utils/validateBody";

export const runtime = "nodejs";

const wishSchema = z.object({
  guestToken: z.string().optional(),
  productId: z.string(),
});

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const body = validateBody(wishSchema, await req.json());
    let guestToken = body.guestToken;
    const userIdStr = user?.sub;

    if (!userIdStr && !guestToken) {
      guestToken = crypto.randomUUID();
    }

    const filter =
      userIdStr && mongoose.isValidObjectId(userIdStr)
        ? { userId: new mongoose.Types.ObjectId(userIdStr) }
        : { guestToken: guestToken as string };

    let list = await Wishlist.findOne(filter);
    if (!list) {
      list = await Wishlist.create({
        ...(userIdStr && mongoose.isValidObjectId(userIdStr)
          ? { userId: new mongoose.Types.ObjectId(userIdStr) }
          : { guestToken }),
        productIds: [],
      });
    }

    const pid = new mongoose.Types.ObjectId(body.productId);
    const exists = list.productIds.some((x: mongoose.Types.ObjectId) =>
      x.equals(pid)
    );
    if (exists)
      list.productIds = list.productIds.filter(
        (x: mongoose.Types.ObjectId) => !x.equals(pid)
      );
    else list.productIds.push(pid);
    await list.save();

    return NextResponse.json({
      data: {
        productIds: list.productIds.map((x: mongoose.Types.ObjectId) =>
          x.toString()
        ),
        guestToken: !userIdStr ? guestToken : undefined,
      },
    });
  });
}

import crypto from "crypto";
import mongoose from "mongoose";
import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { optionalAuth } from "../../middleware/requireAuth";
import { requireAuth } from "../../middleware/requireAuth";
import { Wishlist } from "../../models/Wishlist";
import { validateBody } from "../../utils/validateBody";
import { z } from "zod";

const wishSchema = z.object({
  guestToken: z.string().optional(),
  productId: z.string(),
});

export const wishlistRouter = Router();

wishlistRouter.get(
  "/wishlist",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const guest =
      typeof req.query.guestToken === "string" ? req.query.guestToken : undefined;
    let list = null as InstanceType<typeof Wishlist> | null;
    if (req.user?.sub) {
      list = await Wishlist.findOne({ userId: new mongoose.Types.ObjectId(req.user.sub) });
    } else if (guest) list = await Wishlist.findOne({ guestToken: guest });

    const ids =
      list?.productIds?.map((id: mongoose.Types.ObjectId) => id.toString()) ??
      [];
    res.json({ data: { productIds: ids } });
  })
);

wishlistRouter.post(
  "/wishlist/toggle",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = validateBody(wishSchema, req);
    let guestToken = body.guestToken;
    const userIdStr = req.user?.sub;

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
    const exists = list.productIds.some((x: mongoose.Types.ObjectId) => x.equals(pid));
    if (exists)
      list.productIds = list.productIds.filter(
        (x: mongoose.Types.ObjectId) => !x.equals(pid)
      );
    else list.productIds.push(pid);
    await list.save();

    res.json({
      data: {
        productIds: list.productIds.map((x: mongoose.Types.ObjectId) =>
          x.toString()
        ),
        guestToken: !userIdStr ? guestToken : undefined,
      },
    });
  })
);

wishlistRouter.post(
  "/wishlist/merge",
  requireAuth,
  asyncHandler(async (req, res) => {
    const guest =
      typeof req.body?.guestToken === "string" ? req.body.guestToken : undefined;
    if (!guest) return res.json({ data: { ok: true } });
    const guestList = await Wishlist.findOne({ guestToken: guest });
    const userList = await Wishlist.findOne({
      userId: new mongoose.Types.ObjectId(req.user!.sub),
    });
    const merged = new Set<string>(
      [...(guestList?.productIds ?? []), ...(userList?.productIds ?? [])].map(
        (x: mongoose.Types.ObjectId) => x.toString()
      )
    );
    await Wishlist.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(req.user!.sub) },
      { $set: { productIds: [...merged].map((id) => new mongoose.Types.ObjectId(id)) } },
      { upsert: true, new: true }
    );
    await Wishlist.deleteOne({ guestToken: guest });
    res.json({ data: { ok: true } });
  })
);

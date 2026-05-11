"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRouter = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const requireAuth_1 = require("../../middleware/requireAuth");
const requireAuth_2 = require("../../middleware/requireAuth");
const Wishlist_1 = require("../../models/Wishlist");
const validateBody_1 = require("../../utils/validateBody");
const zod_1 = require("zod");
const wishSchema = zod_1.z.object({
    guestToken: zod_1.z.string().optional(),
    productId: zod_1.z.string(),
});
exports.wishlistRouter = (0, express_1.Router)();
exports.wishlistRouter.get("/wishlist", requireAuth_1.optionalAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const guest = typeof req.query.guestToken === "string" ? req.query.guestToken : undefined;
    let list = null;
    if (req.user?.sub) {
        list = await Wishlist_1.Wishlist.findOne({ userId: new mongoose_1.default.Types.ObjectId(req.user.sub) });
    }
    else if (guest)
        list = await Wishlist_1.Wishlist.findOne({ guestToken: guest });
    const ids = list?.productIds?.map((id) => id.toString()) ??
        [];
    res.json({ data: { productIds: ids } });
}));
exports.wishlistRouter.post("/wishlist/toggle", requireAuth_1.optionalAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = (0, validateBody_1.validateBody)(wishSchema, req);
    let guestToken = body.guestToken;
    const userIdStr = req.user?.sub;
    if (!userIdStr && !guestToken) {
        guestToken = crypto_1.default.randomUUID();
    }
    const filter = userIdStr && mongoose_1.default.isValidObjectId(userIdStr)
        ? { userId: new mongoose_1.default.Types.ObjectId(userIdStr) }
        : { guestToken: guestToken };
    let list = await Wishlist_1.Wishlist.findOne(filter);
    if (!list) {
        list = await Wishlist_1.Wishlist.create({
            ...(userIdStr && mongoose_1.default.isValidObjectId(userIdStr)
                ? { userId: new mongoose_1.default.Types.ObjectId(userIdStr) }
                : { guestToken }),
            productIds: [],
        });
    }
    const pid = new mongoose_1.default.Types.ObjectId(body.productId);
    const exists = list.productIds.some((x) => x.equals(pid));
    if (exists)
        list.productIds = list.productIds.filter((x) => !x.equals(pid));
    else
        list.productIds.push(pid);
    await list.save();
    res.json({
        data: {
            productIds: list.productIds.map((x) => x.toString()),
            guestToken: !userIdStr ? guestToken : undefined,
        },
    });
}));
exports.wishlistRouter.post("/wishlist/merge", requireAuth_2.requireAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const guest = typeof req.body?.guestToken === "string" ? req.body.guestToken : undefined;
    if (!guest)
        return res.json({ data: { ok: true } });
    const guestList = await Wishlist_1.Wishlist.findOne({ guestToken: guest });
    const userList = await Wishlist_1.Wishlist.findOne({
        userId: new mongoose_1.default.Types.ObjectId(req.user.sub),
    });
    const merged = new Set([...(guestList?.productIds ?? []), ...(userList?.productIds ?? [])].map((x) => x.toString()));
    await Wishlist_1.Wishlist.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(req.user.sub) }, { $set: { productIds: [...merged].map((id) => new mongoose_1.default.Types.ObjectId(id)) } }, { upsert: true, new: true });
    await Wishlist_1.Wishlist.deleteOne({ guestToken: guest });
    res.json({ data: { ok: true } });
}));

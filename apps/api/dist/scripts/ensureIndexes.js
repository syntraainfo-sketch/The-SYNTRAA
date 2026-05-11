"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const Cart_1 = require("../models/Cart");
const Wishlist_1 = require("../models/Wishlist");
const Review_1 = require("../models/Review");
const Coupon_1 = require("../models/Coupon");
const CMSPage_1 = require("../models/CMSPage");
const WebhookEvent_1 = require("../models/WebhookEvent");
async function main() {
    await mongoose_1.default.connect(env_1.env.mongodbUri);
    const models = [
        Product_1.Product,
        Category_1.Category,
        Order_1.Order,
        User_1.User,
        Cart_1.Cart,
        Wishlist_1.Wishlist,
        Review_1.Review,
        Coupon_1.Coupon,
        CMSPage_1.CMSPage,
        WebhookEvent_1.WebhookEvent,
    ];
    for (const m of models) {
        await m.syncIndexes();
        console.info(`syncIndexes: ${m.modelName}`);
    }
    console.info("done");
    await mongoose_1.default.disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});

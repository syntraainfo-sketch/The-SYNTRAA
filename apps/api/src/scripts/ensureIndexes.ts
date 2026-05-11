import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Cart } from "../models/Cart";
import { Wishlist } from "../models/Wishlist";
import { Review } from "../models/Review";
import { Coupon } from "../models/Coupon";
import { CMSPage } from "../models/CMSPage";
import { WebhookEvent } from "../models/WebhookEvent";

async function main() {
  await mongoose.connect(env.mongodbUri);
  const models = [
    Product,
    Category,
    Order,
    User,
    Cart,
    Wishlist,
    Review,
    Coupon,
    CMSPage,
    WebhookEvent,
  ];
  for (const m of models) {
    await (m as mongoose.Model<unknown>).syncIndexes();
    console.info(`syncIndexes: ${m.modelName}`);
  }
  console.info("done");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

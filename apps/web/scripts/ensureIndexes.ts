import mongoose from "mongoose";
import { env } from "../src/server/config/env";
import { Product } from "../src/server/models/Product";
import { Category } from "../src/server/models/Category";
import { Order } from "../src/server/models/Order";
import { User } from "../src/server/models/User";
import { Cart } from "../src/server/models/Cart";
import { Wishlist } from "../src/server/models/Wishlist";
import { Review } from "../src/server/models/Review";
import { Coupon } from "../src/server/models/Coupon";
import { CMSPage } from "../src/server/models/CMSPage";
import { WebhookEvent } from "../src/server/models/WebhookEvent";

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

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/server/config/env";
import { User } from "../src/server/models/User";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@thesyntraa.com";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Set SEED_ADMIN_PASSWORD in env to seed admin");
  }
  await mongoose.connect(env.mongodbUri);
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        email,
      },
      $set: { passwordHash, role: "superAdmin", name: "SYNTRAA Admin" },
    },
    { upsert: true, new: true }
  );
  console.info(`Upserted superAdmin: ${email}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

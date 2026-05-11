import mongoose from "mongoose";
import { assertProductionEnv, env } from "../config/env";

declare global {
  var __syntraaMongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (process.env.NODE_ENV === "production") assertProductionEnv();
  mongoose.set("strictQuery", true);
  if (!globalThis.__syntraaMongoosePromise) {
    globalThis.__syntraaMongoosePromise = mongoose.connect(env.mongodbUri);
  }
  await globalThis.__syntraaMongoosePromise;
}

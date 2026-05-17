import mongoose from "mongoose";
import { assertProductionEnv, env } from "../config/env";
import { mongooseConnectWithSrvFallback } from "./mongooseUriConnect";

declare global {
  var __syntraaMongoosePromise: Promise<typeof mongoose> | undefined;
}

function isMongoBadAuth(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err).toLowerCase();
  return msg.includes("bad auth") || msg.includes("authentication failed");
}

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (process.env.NODE_ENV === "production") assertProductionEnv();
  if (!env.mongodbUri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to apps/web/.env.local to use API routes."
    );
  }
  mongoose.set("strictQuery", true);
  if (!globalThis.__syntraaMongoosePromise) {
    globalThis.__syntraaMongoosePromise = (async () => {
      try {
        await mongooseConnectWithSrvFallback(env.mongodbUri);
        return mongoose;
      } catch (err) {
        globalThis.__syntraaMongoosePromise = undefined;
        if (isMongoBadAuth(err)) {
          throw new Error(
            [
              "MongoDB Atlas rejected the database user/password in MONGODB_URI (bad auth).",
              "Open MongoDB Atlas → Database Access → your DB user → Edit Password, then Atlas → Connect → Drivers → copy the new connection string and replace MONGODB_URI in apps/web/.env.local.",
              "If the password contains @ # : / ? & characters, URL-encode them in the URI string.",
            ].join("\n")
          );
        }
        throw err;
      }
    })();
  }
  await globalThis.__syntraaMongoosePromise;
}

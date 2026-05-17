import "./bootstrap-env";
import mongoose from "mongoose";
import { env } from "../src/server/config/env";
import {
  isMongoAuthFailure,
  isMongoSrvDnsFailure,
  isMongoTlsLikeFailure,
  mongooseConnectWithSrvFallback,
} from "../src/server/db/mongooseUriConnect";

async function main() {
  if (!env.mongodbUri?.trim()) {
    console.error(
      "MONGODB_URI is not set. Add your Atlas connection string to apps/web/.env.local as MONGODB_URI=...\n" +
        "Do not paste mongodb+srv://... alone into PowerShell — PowerShell will treat it as a command name and fail.\n" +
        "From the repo root run: npm run mongo:ping"
    );
    process.exit(1);
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const maxTlsAttempts = 4;
  for (let attempt = 1; attempt <= maxTlsAttempts; attempt++) {
    try {
      await mongooseConnectWithSrvFallback(env.mongodbUri);
      break;
    } catch (err: unknown) {
      if (isMongoTlsLikeFailure(err) && attempt < maxTlsAttempts) {
        await sleep(1500);
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect().catch(() => {});
        }
        continue;
      }
      const msg = String((err as Error)?.message ?? err);
      if (isMongoSrvDnsFailure(err)) {
        const hadDirect = Boolean(process.env.MONGODB_URI_DIRECT?.trim());
        throw new Error(
          [
            "MongoDB SRV DNS failed (querySrv). Fix DNS or set MONGODB_URI_DIRECT (standard mongodb://) per .env.example.",
            hadDirect ? "(MONGODB_URI_DIRECT is set; ensure it is mongodb://, not mongodb+srv.)" : "",
            "",
            `Underlying: ${msg}`,
          ]
            .filter(Boolean)
            .join("\n"),
          { cause: err as Error }
        );
      }
      if (isMongoTlsLikeFailure(err)) {
        throw new Error(
          [
            "MongoDB TLS handshake failed. Another network/VPN, disabling SSL inspection for dev, or allowing outbound TCP 27017 often fixes this.",
            "",
            "Reminder: a mongodb+srv:// string is not a PowerShell command — use `npm run mongo:ping` from the repo root to test after the network path works.",
            "",
            `Underlying: ${msg}`,
          ].join("\n"),
          { cause: err as Error }
        );
      }
      if (isMongoAuthFailure(err)) {
        throw new Error(
          [
            "MongoDB authentication failed (bad auth).",
            "- In Atlas → Database Access, confirm the database username/password match the credentials embedded in MONGODB_URI (not your Atlas account email/password).",
            "- Paste a fresh connection string from Atlas → Connect → Drivers → Node.js, or URL-encode special characters in the password (see apps/web/.env.example).",
            "",
            `Underlying: ${msg}`,
          ].join("\n"),
          { cause: err as Error }
        );
      }
      throw err;
    }
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("No database handle after connect");
  }
  const res = await db.admin().command({ ping: 1 });
  console.info("MongoDB ping OK (admin.ping):", res);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

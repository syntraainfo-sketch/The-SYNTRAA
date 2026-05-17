import "./bootstrap-env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/server/config/env";
import {
  isMongoAuthFailure,
  isMongoSrvDnsFailure,
  isMongoTlsLikeFailure,
  mongooseConnectWithSrvFallback,
} from "../src/server/db/mongooseUriConnect";
import { User } from "../src/server/models/User";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@thesyntraa.com";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "Set SEED_ADMIN_PASSWORD in apps/web/.env.local (or export it), then run npm run seed:admin -w web again."
    );
  }
  if (!env.mongodbUri) {
    throw new Error(
      "MONGODB_URI is empty. Add it to apps/web/.env.local so the seed script can connect."
    );
  }

  try {
    await mongooseConnectWithSrvFallback(env.mongodbUri);
  } catch (err: unknown) {
    const e = err as { message?: string };
    const msg = String(e?.message ?? err);
    if (isMongoSrvDnsFailure(err)) {
      const hadDirect = Boolean(process.env.MONGODB_URI_DIRECT?.trim());
      throw new Error(
        [
          "MongoDB SRV DNS lookup failed (querySrv). This is usually network/DNS, not bad credentials.",
          "",
          "Try in order:",
          "0) Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 in apps/web/.env.local (Node uses public DNS for SRV — fixes many ISP/router blocks).",
          "1) Add MONGODB_URI_DIRECT with Atlas **standard** mongodb://… URI (not mongodb+srv).",
          "2) Or replace MONGODB_URI with that standard string.",
          hadDirect
            ? "\n(MONGODB_URI_DIRECT is set but SRV still failed: use mongodb:// in DIRECT, or fix network.)"
            : "",
          "",
          `Underlying: ${msg}`,
        ].join("\n")
      );
    }
    if (isMongoTlsLikeFailure(err)) {
      throw new Error(
        [
          "MongoDB TLS handshake failed (e.g. ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR / tlsv1 alert internal error).",
          "TCP to Atlas can succeed while TLS on port 27017 is broken by the path — antivirus HTTPS inspection, ISP filtering, or a firewall, not your seed script logic.",
          "",
          "Try: another network or VPN, turn off SSL/TLS scanning for development, allow outbound TCP 27017 to Atlas, confirm Atlas Network Access allows your current IP.",
          "If TLS keeps failing on this machine, use Atlas **standard connection string** (`mongodb://host:27017,...`) as `MONGODB_URI_DIRECT` (see apps/web/.env.example).",
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
          "- Confirm Atlas → Database Access credentials match `MONGODB_URI`, or paste a fresh string from Connect → Drivers → Node.js.",
          "- URL-encode special characters in the password (see apps/web/.env.example).",
          "",
          `Underlying: ${msg}`,
        ].join("\n"),
        { cause: err as Error }
      );
    }
    throw err;
  }

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

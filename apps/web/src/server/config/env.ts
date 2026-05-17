import { firstEnv } from "@/lib/envPick";

export function assertProductionEnv(): void {
  const required = [
    "MONGODB_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
  ] as const;
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI ?? "",
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? "7d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  webPublicUrl: process.env.WEB_PUBLIC_URL ?? "http://localhost:3000",
  cloudinary: {
    cloudName: firstEnv(
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_PUBLIC_ID",
      "cloudinary_cloud_name",
      "cloudinary_public_id",
    ),
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    folder:
      firstEnv("CLOUDINARY_FOLDER", "cloudinary_folder") || "syntraa",
  },
  jazzcash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID ?? "",
    password: process.env.JAZZCASH_PASSWORD ?? "",
    salt: process.env.JAZZCASH_INTEGRITY_SALT ?? "",
    returnUrl: process.env.JAZZCASH_RETURN_URL ?? "",
    postUrl: process.env.JAZZCASH_POST_URL ?? "",
  },
  easypaisa: {
    storeId: process.env.EASYPAISA_STORE_ID ?? "",
    hashKey: process.env.EASYPAISA_HASH_KEY ?? "",
    postUrl: process.env.EASYPAISA_POST_URL ?? "",
    returnUrl: process.env.EASYPAISA_RETURN_URL ?? "",
  },
  pkrPerUsd: Number(process.env.PKR_PER_USD ?? 280),
};

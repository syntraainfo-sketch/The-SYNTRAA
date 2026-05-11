import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

export function configureCloudinary(): void {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret)
    return;
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export function signUploadParams(opts?: { folder?: string }) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = String(opts?.folder ?? env.cloudinary.folder);
  const toSign: Record<string, string | number> = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    toSign,
    env.cloudinary.apiSecret
  );
  return { signature, timestamp, folder, apiKey: env.cloudinary.apiKey };
}

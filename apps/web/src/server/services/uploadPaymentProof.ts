import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { configureCloudinary } from "./cloudinarySign";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadPaymentProof(file: File): Promise<string> {
  if (!env.cloudinary.apiSecret || !env.cloudinary.cloudName) {
    throw new AppError(503, "Screenshot upload is not configured.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new AppError(400, "Please upload a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new AppError(400, "Image must be 5 MB or smaller.");
  }

  configureCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = `${env.cloudinary.folder}/payment-proofs`;

  const result = await new Promise<{ public_id?: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, res) => {
        if (err) reject(err);
        else resolve(res ?? {});
      }
    );
    stream.end(buffer);
  });

  if (!result.public_id) {
    throw new AppError(500, "Upload failed. Please try again.");
  }
  return result.public_id;
}

import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { signUploadParams, configureCloudinary } from "@/server/services/cloudinarySign";
import { env } from "@/server/config/env";
import { AppError } from "@/server/utils/AppError";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    if (!env.cloudinary.apiSecret) throw new AppError(503, "Cloudinary not configured");
    configureCloudinary();
    const json = (await req.json()) as { folder?: string };
    const folder =
      typeof json?.folder === "string" ? json.folder : env.cloudinary.folder;
    const signed = signUploadParams({ folder: String(folder) });
    return NextResponse.json({
      data: {
        ...signed,
        cloudName: env.cloudinary.cloudName,
      },
    });
  });
}

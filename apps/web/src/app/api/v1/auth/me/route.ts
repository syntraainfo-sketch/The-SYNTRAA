import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser } from "@/server/auth/headers";
import { User } from "@/server/models/User";
import { AppError } from "@/server/utils/AppError";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const u = getRequiredUser(req);
    const doc = await User.findById(u.sub).select("email role name");
    if (!doc) throw new AppError(404, "User not found");
    return NextResponse.json({ data: doc });
  });
}

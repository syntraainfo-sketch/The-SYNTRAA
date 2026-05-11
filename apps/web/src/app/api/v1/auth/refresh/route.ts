import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { User } from "@/server/models/User";
import { AppError } from "@/server/utils/AppError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "@/server/utils/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return runRoute(async () => {
    await connectMongo();
    const json = (await req.json()) as { refreshToken?: string };
    const token = json.refreshToken;
    if (!token) throw new AppError(400, "refreshToken required");
    const decoded = verifyRefresh(token);
    const user = await User.findById(decoded.sub);
    if (!user) throw new AppError(401, "Invalid refresh");
    const payload = { sub: user._id.toString(), role: user.role };
    return NextResponse.json({
      data: {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  });
}

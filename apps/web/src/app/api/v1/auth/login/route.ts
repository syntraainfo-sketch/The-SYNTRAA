import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { loginSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { User } from "@/server/models/User";
import { AppError } from "@/server/utils/AppError";
import { signAccessToken, signRefreshToken } from "@/server/utils/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return runRoute(async () => {
    await connectMongo();
    const body = validateBody(loginSchema, await req.json());
    const user = await User.findOne({ email: body.email });
    if (!user) throw new AppError(401, "Invalid credentials");
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new AppError(401, "Invalid credentials");
    const payload = { sub: user._id.toString(), role: user.role };
    return NextResponse.json({
      data: {
        user: { id: user._id, email: user.email, role: user.role },
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    });
  });
}

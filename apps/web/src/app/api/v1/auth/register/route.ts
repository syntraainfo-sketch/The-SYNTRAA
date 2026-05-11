import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { registerSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { User } from "@/server/models/User";
import { AppError } from "@/server/utils/AppError";
import { signAccessToken, signRefreshToken } from "@/server/utils/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return runRoute(async () => {
    await connectMongo();
    const body = validateBody(registerSchema, await req.json());
    const existing = await User.findOne({ email: body.email });
    if (existing) throw new AppError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      email: body.email,
      passwordHash,
      name: body.name,
      role: "customer",
    });
    const payload = { sub: user._id.toString(), role: user.role };
    return NextResponse.json(
      {
        data: {
          user: { id: user._id, email: user.email, role: user.role },
          accessToken: signAccessToken(payload),
          refreshToken: signRefreshToken(payload),
        },
      },
      { status: 201 }
    );
  });
}

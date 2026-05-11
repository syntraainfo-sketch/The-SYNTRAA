import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { User } from "@/server/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const customers = await User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .limit(500)
      .select("email name createdAt");
    return NextResponse.json({ data: customers });
  });
}

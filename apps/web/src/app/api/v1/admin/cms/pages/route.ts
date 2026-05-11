import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { CMSPage } from "@/server/models/CMSPage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const pages = await CMSPage.find({}).sort({ slug: 1 });
    return NextResponse.json({ data: pages });
  });
}

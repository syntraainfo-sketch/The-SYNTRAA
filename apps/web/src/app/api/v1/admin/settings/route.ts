import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { Settings } from "@/server/models/Settings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    let s = await Settings.findById("global");
    if (!s) {
      s = await Settings.create({ _id: "global" });
    }
    return NextResponse.json({ data: s });
  });
}

export async function PATCH(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const body = await req.json();
    const s = await Settings.findOneAndUpdate(
      { _id: "global" },
      { $set: body },
      { upsert: true, new: true }
    );
    return NextResponse.json({ data: s });
  });
}

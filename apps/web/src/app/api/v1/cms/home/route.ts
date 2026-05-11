import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { Settings } from "@/server/models/Settings";
import { runRoute } from "@/server/http/runRoute";

export const runtime = "nodejs";

export async function GET() {
  return runRoute(async () => {
    await connectMongo();
    const s = await Settings.findById("global");
    return NextResponse.json({ data: { sections: s?.homeSections ?? [] } });
  });
}

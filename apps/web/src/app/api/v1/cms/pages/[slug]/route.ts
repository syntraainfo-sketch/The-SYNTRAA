import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { CMSPage } from "@/server/models/CMSPage";
import { runRoute } from "@/server/http/runRoute";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const { slug } = await ctx.params;
    const page = await CMSPage.findOne({ slug });
    if (!page) {
      return NextResponse.json(
        { error: { message: "Not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: page });
  });
}

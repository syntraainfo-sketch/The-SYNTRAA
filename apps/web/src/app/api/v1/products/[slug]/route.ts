import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { Product } from "@/server/models/Product";
import { runRoute } from "@/server/http/runRoute";
import { productJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const { slug } = await ctx.params;
    const p = await Product.findOne({ slug });
    if (!p) {
      return NextResponse.json(
        { error: { message: "Not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: productJSON(p) });
  });
}

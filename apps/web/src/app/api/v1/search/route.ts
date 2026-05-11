import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { Product } from "@/server/models/Product";
import { runRoute } from "@/server/http/runRoute";
import { productJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (!q) {
      return NextResponse.json({ data: [], meta: { total: 0 } });
    }
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const items = await Product.find({
      $or: [{ title: rx }, { descriptionShort: rx }, { slug: rx }],
    }).limit(48);
    return NextResponse.json({
      data: items.map((p) => productJSON(p)),
      meta: { total: items.length },
    });
  });
}

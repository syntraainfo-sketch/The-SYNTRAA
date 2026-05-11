import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { Category } from "@/server/models/Category";
import { Product } from "@/server/models/Product";
import { runRoute } from "@/server/http/runRoute";
import { productJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";
    const slug = searchParams.get("categorySlug") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? "24") || 24, 72);
    const skip = Number(searchParams.get("skip") ?? "0") || 0;
    const query: Record<string, unknown> = {};
    if (featured) query.featured = true;
    if (slug) {
      const cat = await Category.findOne({ slug });
      if (cat) query.categories = cat._id;
    }
    const [items, total] = await Promise.all([
      Product.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(false),
      Product.countDocuments(query),
    ]);
    return NextResponse.json({
      data: items.map((p) => productJSON(p)),
      meta: { total, skip, limit },
    });
  });
}

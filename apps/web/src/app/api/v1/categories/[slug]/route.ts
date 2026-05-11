import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { Category } from "@/server/models/Category";
import { Product } from "@/server/models/Product";
import { runRoute } from "@/server/http/runRoute";
import { categoryJSON, productJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const { slug } = await ctx.params;
    const c = await Category.findOne({ slug });
    if (!c) {
      return NextResponse.json(
        { error: { message: "Not found" } },
        { status: 404 }
      );
    }
    const products = await Product.find({ categories: c._id }).limit(48);
    return NextResponse.json({
      data: {
        category: categoryJSON(c),
        products: products.map((p) => productJSON(p)),
      },
    });
  });
}

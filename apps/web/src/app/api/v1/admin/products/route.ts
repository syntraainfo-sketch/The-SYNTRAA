import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { productCreateSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { Product } from "@/server/models/Product";
import { Category } from "@/server/models/Category";
import { productJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "50") || 50, 200);
    const items = await Product.find({}).sort({ updatedAt: -1 }).limit(limit);
    return NextResponse.json({ data: items.map((p) => productJSON(p)) });
  });
}

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const body = validateBody(productCreateSchema, await req.json());
    const cats = await Category.find({ _id: { $in: body.categories } });
    const p = await Product.create({
      ...body,
      categories: cats.map((c) => c._id),
    });
    return NextResponse.json({ data: productJSON(p) }, { status: 201 });
  });
}

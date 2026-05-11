import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { productUpdateSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { Product } from "@/server/models/Product";
import { Category } from "@/server/models/Category";
import { productJSON } from "@/server/serialize";
import { AppError } from "@/server/utils/AppError";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) throw new AppError(400, "Bad id");
    const body = validateBody(productUpdateSchema, await req.json());
    const update: Record<string, unknown> = { ...body };
    if (body.categories) {
      const cats = await Category.find({ _id: { $in: body.categories } });
      update.categories = cats.map((c) => c._id);
    }
    const p = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!p) throw new AppError(404, "Not found");
    return NextResponse.json({ data: productJSON(p) });
  });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const { id } = await ctx.params;
    await Product.findByIdAndDelete(id);
    return new NextResponse(null, { status: 204 });
  });
}

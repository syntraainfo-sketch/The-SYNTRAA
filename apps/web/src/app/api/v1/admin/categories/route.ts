import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { categoryCreateSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { Category } from "@/server/models/Category";
import { categoryJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const cats = await Category.find({}).sort({ order: 1 });
    return NextResponse.json({ data: cats.map((c) => categoryJSON(c)) });
  });
}

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const body = validateBody(categoryCreateSchema, await req.json());
    const c = await Category.create({
      name: body.name,
      slug: body.slug,
      parentId:
        body.parentId && mongoose.isValidObjectId(body.parentId)
          ? new mongoose.Types.ObjectId(body.parentId)
          : undefined,
      order: body.order,
      heroImagePublicId: body.heroImagePublicId,
    });
    return NextResponse.json({ data: categoryJSON(c) }, { status: 201 });
  });
}

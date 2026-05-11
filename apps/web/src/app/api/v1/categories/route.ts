import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { Category } from "@/server/models/Category";
import { runRoute } from "@/server/http/runRoute";
import { categoryJSON } from "@/server/serialize";

export const runtime = "nodejs";

export async function GET() {
  return runRoute(async () => {
    await connectMongo();
    const cats = await Category.find({}).sort({ order: 1, name: 1 });
    return NextResponse.json({ data: cats.map((c) => categoryJSON(c)) });
  });
}

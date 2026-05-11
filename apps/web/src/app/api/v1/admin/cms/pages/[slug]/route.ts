import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { cmsPageSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { CMSPage } from "@/server/models/CMSPage";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const { slug } = await ctx.params;
    const body = validateBody(cmsPageSchema, await req.json());
    const page = await CMSPage.findOneAndUpdate(
      { slug },
      { $set: body },
      { upsert: true, new: true }
    );
    return NextResponse.json({ data: page });
  });
}

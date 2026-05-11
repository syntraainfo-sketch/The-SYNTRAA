import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { orderStatusPatchSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { Order } from "@/server/models/Order";
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
    const body = validateBody(orderStatusPatchSchema, await req.json());
    const order = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );
    if (!order) throw new AppError(404, "Not found");
    return NextResponse.json({ data: order });
  });
}

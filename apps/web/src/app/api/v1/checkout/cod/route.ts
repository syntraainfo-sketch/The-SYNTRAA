import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getOptionalUser } from "@/server/auth/headers";
import { manualCheckoutSchema } from "@/server/validators/schemas";
import { validateBody } from "@/server/utils/validateBody";
import { placeManualOrder } from "@/server/services/manualCheckout";
import { getGlobalSettings } from "@/server/services/cartCheckout";
import { AppError } from "@/server/utils/AppError";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getOptionalUser(req);
    const input = validateBody(manualCheckoutSchema, await req.json());
    const settings = await getGlobalSettings();
    if (settings.paymentFlags?.cod === false) {
      throw new AppError(400, "Cash on delivery is not available");
    }

    const order = await placeManualOrder(input, user?.sub, "cod");

    return NextResponse.json({
      data: {
        orderNumber: order.orderNumber,
        method: "cod",
      },
    });
  });
}

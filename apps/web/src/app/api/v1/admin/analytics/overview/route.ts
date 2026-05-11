import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getRequiredUser, requireAdminRole } from "@/server/auth/headers";
import { Order } from "@/server/models/Order";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return runRoute(async () => {
    await connectMongo();
    const user = getRequiredUser(req);
    requireAdminRole(user);
    const [rev] = await Order.aggregate<{
      revenue: number;
      orders: number;
    }>([
      {
        $match: {
          status: { $in: ["paid", "processing", "shipped"] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$subtotalUSD" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const pendingPaymentOrders = await Order.countDocuments({
      status: "pending_payment",
    });
    return NextResponse.json({
      data: {
        revenue: rev?.revenue ?? 0,
        fulfilledOrders: rev?.orders ?? 0,
        pendingPaymentOrders,
        lowStockSkus: 0,
      },
    });
  });
}

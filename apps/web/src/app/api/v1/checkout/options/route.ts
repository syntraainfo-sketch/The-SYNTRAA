import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/mongoose";
import { runRoute } from "@/server/http/runRoute";
import { getGlobalSettings } from "@/server/services/cartCheckout";

export const runtime = "nodejs";

export async function GET() {
  return runRoute(async () => {
    await connectMongo();
    const s = await getGlobalSettings();
    const flags = s.paymentFlags ?? {};

    return NextResponse.json({
      data: {
        bankTransfer: flags.bankTransfer !== false,
        easypaisa: flags.easypaisa !== false,
        cod: flags.cod !== false,
        bankAccount: s.bankAccount
          ? {
              bankName: s.bankAccount.bankName,
              accountTitle: s.bankAccount.accountTitle,
              accountNumber: s.bankAccount.accountNumber,
              iban: s.bankAccount.iban,
              branch: s.bankAccount.branch,
              instructions: s.bankAccount.instructions,
            }
          : undefined,
        easypaisaWallet: s.easypaisaWallet || undefined,
      },
    });
  });
}

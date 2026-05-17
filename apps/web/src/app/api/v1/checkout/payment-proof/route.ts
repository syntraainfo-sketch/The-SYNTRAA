import { NextRequest, NextResponse } from "next/server";
import { runRoute } from "@/server/http/runRoute";
import { uploadPaymentProof } from "@/server/services/uploadPaymentProof";
import { AppError } from "@/server/utils/AppError";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return runRoute(async () => {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError(400, "Please choose a payment screenshot.");
    }
    const publicId = await uploadPaymentProof(file);
    return NextResponse.json({ data: { publicId } });
  });
}

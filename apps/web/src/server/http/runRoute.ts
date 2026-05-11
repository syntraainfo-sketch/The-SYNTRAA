import { NextResponse } from "next/server";
import { AppError } from "../utils/AppError";

export async function runRoute(
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json(
        { error: { message: e.message, code: e.code } },
        { status: e.statusCode }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

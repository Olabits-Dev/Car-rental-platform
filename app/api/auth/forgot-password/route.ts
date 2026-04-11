import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  requestPasswordResetWithAuthService,
} from "@/lib/backend-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const payload = await requestPasswordResetWithAuthService({
      email: body.email ?? "",
    });

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "The reset service is unavailable right now." },
      { status: 503 },
    );
  }
}

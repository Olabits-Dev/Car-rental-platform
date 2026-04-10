import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  updateInquiryStatusWithAuthService,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getVerifiedSessionToken,
} from "@/lib/session";
import type { InquiryStatus } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/inquiries/[id]">,
) {
  try {
    const sessionToken = getVerifiedSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: InquiryStatus;
    };

    const payload = await updateInquiryStatusWithAuthService(
      sessionToken,
      id,
      body.status ?? "new",
    );

    return NextResponse.json({ inquiry: payload.inquiry });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Could not update that inquiry right now." },
      { status: 500 },
    );
  }
}

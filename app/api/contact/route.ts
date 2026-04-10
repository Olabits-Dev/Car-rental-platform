import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  createContactInquiryWithAuthService,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getVerifiedSessionToken,
} from "@/lib/session";
import type { CarType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getVerifiedSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      vehicleType?: CarType;
      message?: string;
    };

    const payload = await createContactInquiryWithAuthService(sessionToken, {
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone,
      location: body.location,
      vehicleType: body.vehicleType,
      message: body.message ?? "",
    });

    return NextResponse.json({ inquiry: payload.inquiry }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  resetPasswordWithAuthService,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };

    await resetPasswordWithAuthService({
      token: body.token ?? "",
      password: body.password ?? "",
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      ...getSessionCookieOptions(),
      expires: new Date(0),
    });

    return response;
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

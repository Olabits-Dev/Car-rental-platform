import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  registerWithAuthService,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  signSessionToken,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const { user, sessionToken } = await registerWithAuthService({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    const response = NextResponse.json({ user });
    response.cookies.set(
      SESSION_COOKIE,
      signSessionToken(sessionToken),
      getSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "The authentication service is unavailable right now." },
      { status: 503 },
    );
  }
}

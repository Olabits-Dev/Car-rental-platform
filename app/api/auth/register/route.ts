import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  signSessionToken,
} from "@/lib/session";
import { StoreError, createSession, registerUser } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const user = registerUser({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    const session = createSession(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set(
      SESSION_COOKIE,
      signSessionToken(session.token),
      getSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Could not create your account." },
      { status: 500 },
    );
  }
}

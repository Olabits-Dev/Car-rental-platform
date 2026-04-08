import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  signSessionToken,
} from "@/lib/session";
import { authenticateUser, createSession } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string };
  const user = authenticateUser({
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!user) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const session = createSession(user.id);
  const response = NextResponse.json({ user });
  response.cookies.set(
    SESSION_COOKIE,
    signSessionToken(session.token),
    getSessionCookieOptions(),
  );

  return response;
}

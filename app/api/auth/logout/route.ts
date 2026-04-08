import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  getVerifiedSessionToken,
} from "@/lib/session";
import { removeSession } from "@/lib/store";

export async function POST(request: NextRequest) {
  const sessionToken = getVerifiedSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (sessionToken) {
    removeSession(sessionToken);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    expires: new Date(0),
  });

  return response;
}

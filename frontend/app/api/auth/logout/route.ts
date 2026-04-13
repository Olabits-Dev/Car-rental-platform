import { NextRequest, NextResponse } from "next/server";
import { logoutWithAuthService } from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  getVerifiedSessionToken,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionToken = getVerifiedSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  try {
    await logoutWithAuthService(sessionToken);
  } catch {
    // Clear the local cookie even if the auth service is temporarily unavailable.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    expires: new Date(0),
  });

  return response;
}

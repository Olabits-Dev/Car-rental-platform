import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  loginWithAuthService,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  signSessionToken,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  console.log("[Auth Route] POST /api/auth/login called");
  
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    console.log("[Auth Route] Body parsed successfully");
    
    console.log("[Auth Route] Calling loginWithAuthService...");
    const { user, sessionToken } = await loginWithAuthService({
      email: body.email ?? "",
      password: body.password ?? "",
    });
    console.log("[Auth Route] Got response from backend");

    const response = NextResponse.json({ user });
    response.cookies.set(
      SESSION_COOKIE,
      signSessionToken(sessionToken),
      getSessionCookieOptions(),
    );

    console.log("[Auth Route] Returning success response");
    return response;
  } catch (error) {
    console.error("[Auth Route] Error occurred:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof AuthServiceError) {
      console.error("[Auth Route] AuthServiceError status:", error.statusCode);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("[Auth Route] Unknown error caught");
    return NextResponse.json(
      { error: "The authentication service is unavailable right now." },
      { status: 503 },
    );
  }
}

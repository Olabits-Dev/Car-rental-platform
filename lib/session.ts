import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionSecret } from "@/lib/env";
import { getUserFromSessionToken } from "@/lib/store";

export const SESSION_COOKIE = "rideflex_session";

function createSessionSignature(sessionToken: string) {
  return createHmac("sha256", getSessionSecret())
    .update(sessionToken)
    .digest("base64url");
}

export function signSessionToken(sessionToken: string) {
  return `${sessionToken}.${createSessionSignature(sessionToken)}`;
}

export function getVerifiedSessionToken(cookieValue?: string) {
  if (!cookieValue) {
    return undefined;
  }

  const [sessionToken, signature, ...rest] = cookieValue.split(".");

  if (!sessionToken || !signature || rest.length > 0) {
    return undefined;
  }

  const expectedSignature = createSessionSignature(sessionToken);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return undefined;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return undefined;
  }

  return sessionToken;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function getCurrentUser() {
  const sessionToken = getVerifiedSessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  return getUserFromSessionToken(sessionToken);
}

export async function requireUser(redirectTo = "/login?redirect=/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

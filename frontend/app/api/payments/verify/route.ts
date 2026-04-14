import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/env";
import {
  getAuthUserBySessionToken,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getVerifiedSessionToken,
} from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getVerifiedSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    const user = await getAuthUserBySessionToken(sessionToken);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reference = request.nextUrl.searchParams.get("reference");
    const paymentId = request.nextUrl.searchParams.get("paymentId");

    if (!reference || !paymentId) {
      return NextResponse.json(
        { error: "Missing reference or paymentId" },
        { status: 400 }
      );
    }

    // Call backend API to verify payment
    const response = await fetch(`${getBackendApiUrl()}/payment/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        reference,
        paymentId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || "Failed to verify payment" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

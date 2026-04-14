import { NextRequest, NextResponse } from "next/server";
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

    const paymentId = request.nextUrl.searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing paymentId" },
        { status: 400 }
      );
    }

    // Call backend API to get payment status
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:4000/api";
    const baseUrl = backendUrl.endsWith("/api") ? backendUrl : `${backendUrl}/api`;
    const response = await fetch(
      `${baseUrl}/payment/status?paymentId=${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || "Failed to get payment status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Failed to get payment status" },
      { status: 500 }
    );
  }
}

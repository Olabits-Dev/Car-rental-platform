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

    if (!user || (user.role !== "owner" && user.role !== "agent")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Call backend API to get payment reports
    const response = await fetch(`${getBackendApiUrl()}/admin/payments/report`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || "Failed to fetch payment reports" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Payment report error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment reports" },
      { status: 500 }
    );
  }
}

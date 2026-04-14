import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/env";
import {
  getAuthUserBySessionToken,
} from "@/lib/backend-auth";
import {
  SESSION_COOKIE,
  getVerifiedSessionToken,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getVerifiedSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    const user = await getAuthUserBySessionToken(sessionToken);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      bookingId?: string;
      amount?: number;
    };

    if (!body.bookingId || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: "Invalid booking ID or amount" },
        { status: 400 }
      );
    }

    // Call backend API to initialize payment
    const response = await fetch(`${getBackendApiUrl()}/payment/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        bookingId: body.bookingId,
        amount: body.amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || "Failed to initialize payment" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}

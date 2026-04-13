import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  createBookingWithAuthService,
  getBookingsWithAuthService,
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
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = await getBookingsWithAuthService(sessionToken);

    return NextResponse.json({
      bookings: payload?.bookings ?? [],
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "The authentication service is unavailable right now." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getVerifiedSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    const user = await getAuthUserBySessionToken(sessionToken);

    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = (await request.json()) as {
      carId?: string;
      startDate?: string;
      endDate?: string;
      offerCode?: string;
    };

    const payload = await createBookingWithAuthService(sessionToken, {
      carId: body.carId ?? "",
      startDate: body.startDate ?? "",
      endDate: body.endDate ?? "",
      offerCode: body.offerCode,
    });

    return NextResponse.json({ booking: payload.booking }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while creating the booking." },
      { status: 500 },
    );
  }
}

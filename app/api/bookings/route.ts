import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  getVerifiedSessionToken,
  signSessionToken,
} from "@/lib/session";
import {
  StoreError,
  createBooking,
  getBookingsForUser,
  getUserFromSessionToken,
} from "@/lib/store";

export async function GET(request: NextRequest) {
  const sessionToken = getVerifiedSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const user = getUserFromSessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    bookings: getBookingsForUser(user.id),
  });
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getVerifiedSessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    const user = getUserFromSessionToken(sessionToken);

    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = (await request.json()) as {
      carId?: string;
      startDate?: string;
      endDate?: string;
      offerCode?: string;
    };

    const booking = createBooking({
      userId: user.id,
      carId: body.carId ?? "",
      startDate: body.startDate ?? "",
      endDate: body.endDate ?? "",
      offerCode: body.offerCode,
    });

    const response = NextResponse.json({ booking });
    response.cookies.set(
      SESSION_COOKIE,
      sessionToken ? signSessionToken(sessionToken) : "",
      getSessionCookieOptions(),
    );
    return response;
  } catch (error) {
    if (error instanceof StoreError) {
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

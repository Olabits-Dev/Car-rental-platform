import { NextRequest, NextResponse } from "next/server";
import { getBookingsForCar, getCarById } from "@/lib/store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const car = getCarById(id);

  if (!car) {
    return NextResponse.json({ error: "Car not found." }, { status: 404 });
  }

  const upcomingBookings = getBookingsForCar(id).filter(
    (booking) => new Date(booking.endDate).getTime() > Date.now(),
  );

  return NextResponse.json({
    car,
    upcomingBookings,
  });
}

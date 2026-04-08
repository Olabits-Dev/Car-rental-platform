import { NextRequest, NextResponse } from "next/server";
import { StoreError, createContactInquiry } from "@/lib/store";
import type { CarType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      vehicleType?: CarType;
      message?: string;
    };

    const inquiry = createContactInquiry({
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone,
      location: body.location,
      vehicleType: body.vehicleType,
      message: body.message ?? "",
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 },
    );
  }
}

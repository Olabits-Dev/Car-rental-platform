import { NextRequest, NextResponse } from "next/server";
import { normalizeCarFilters } from "@/lib/query";
import { getCarTypes, getLocations, listCars } from "@/lib/store";

export async function GET(request: NextRequest) {
  const filters = normalizeCarFilters(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  return NextResponse.json({
    cars: listCars(filters),
    filters,
    locations: getLocations(),
    types: getCarTypes(),
  });
}

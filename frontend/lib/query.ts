import type { CarFilters } from "@/lib/types";

export type SearchParamRecord = Record<string, string | string[] | undefined>;

export function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeCarFilters(searchParams: SearchParamRecord): CarFilters {
  const query = getFirstValue(searchParams.query)?.trim();
  const location = getFirstValue(searchParams.location)?.trim();
  const type = getFirstValue(searchParams.type)?.trim();
  const maxPriceValue = getFirstValue(searchParams.maxPrice)?.trim();
  const maxPrice = maxPriceValue ? Number(maxPriceValue) : undefined;

  return {
    query: query || undefined,
    location: location || undefined,
    type: (type as CarFilters["type"]) || undefined,
    maxPrice:
      typeof maxPrice === "number" && Number.isFinite(maxPrice) && maxPrice > 0
        ? maxPrice
        : undefined,
  };
}

export function getSafeRedirectPath(
  value: string | string[] | undefined,
  fallback = "/dashboard",
) {
  const redirectPath = getFirstValue(value);

  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return fallback;
  }

  return redirectPath;
}

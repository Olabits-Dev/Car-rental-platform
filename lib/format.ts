export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateRange(startDate: string, endDate: string) {
  return `${formatDateTime(startDate)} to ${formatDateTime(endDate)}`;
}

export function getDurationInHours(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return Math.max(0, end - start) / (1000 * 60 * 60);
}

export function formatDuration(startDate: string, endDate: string) {
  const hours = getDurationInHours(startDate, endDate);

  if (hours < 24) {
    return `${Math.max(1, Math.ceil(hours))} hour${hours > 1 ? "s" : ""}`;
  }

  const days = Math.ceil(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
}

export function formatBookingWindow(startDate: string, endDate: string) {
  return `${formatDuration(startDate, endDate)} | ${formatDateRange(startDate, endDate)}`;
}

export function calculateBookingPrice(
  pricePerDay: number,
  startDate: string,
  endDate: string,
) {
  const hours = getDurationInHours(startDate, endDate);
  const billableDays = Math.max(1, Math.ceil(hours / 24));

  return pricePerDay * billableDays;
}

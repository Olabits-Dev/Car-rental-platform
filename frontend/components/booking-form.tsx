"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { calculateBookingPrice, formatCurrency, formatDuration } from "@/lib/format";
import type { DealOffer } from "@/lib/types";

type BookingFormProps = {
  carId: string;
  pricePerDay: number;
  canBook: boolean;
  offer?: DealOffer | null;
};

function toLocalDateTimeValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitialBookingRange() {
  const startDate = new Date(Date.now() + 1000 * 60 * 60 * 26);
  startDate.setMinutes(0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  return {
    startDate: toLocalDateTimeValue(startDate),
    endDate: toLocalDateTimeValue(endDate),
  };
}

function getMinPickupDate() {
  const minDate = new Date(Date.now() + 1000 * 60 * 60);
  return toLocalDateTimeValue(minDate);
}

export function BookingForm({
  carId,
  pricePerDay,
  canBook,
  offer,
}: BookingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(getInitialBookingRange);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const minPickupDate = useMemo(() => getMinPickupDate(), []);

  const hasValidRange =
    Boolean(form.startDate) &&
    Boolean(form.endDate) &&
    new Date(form.endDate).getTime() > new Date(form.startDate).getTime();

  const effectivePricePerDay = offer?.salePricePerDay ?? pricePerDay;
  const totalPrice =
    hasValidRange
      ? calculateBookingPrice(effectivePricePerDay, form.startDate, form.endDate)
      : effectivePricePerDay;

  const originalTotalPrice =
    offer && hasValidRange
      ? calculateBookingPrice(pricePerDay, form.startDate, form.endDate)
      : offer
        ? pricePerDay
        : null;

  const bookingSummary = hasValidRange
    ? formatDuration(form.startDate, form.endDate)
    : "Select a valid pickup and return time";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canBook) {
      const redirectPath = offer
        ? `/cars/${carId}?offer=${offer.code}`
        : `/cars/${carId}`;

      startTransition(() => {
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      });
      return;
    }

    setPending(true);

    try {
      // Step 1: Create booking
      const bookingResponse = await apiClient.createBooking({
        carId,
        startDate: form.startDate,
        endDate: form.endDate,
        offerCode: offer?.code,
      });

      const bookingId = bookingResponse.booking?.id;
      const bookingTotal = bookingResponse.booking?.totalPrice;

      if (!bookingId || !bookingTotal) {
        setError("We could not create your booking.");
        setPending(false);
        return;
      }

      // Step 2: Initialize payment
      const paymentResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          amount: bookingTotal,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        setError(errorData.error || "Payment initialization failed");
        setPending(false);
        return;
      }

      const paymentData = await paymentResponse.json();

      // Step 3: Store payment ID before redirecting
      if (paymentData.payment?.id) {
        sessionStorage.setItem("paymentId", paymentData.payment.id);
        sessionStorage.setItem("bookingId", bookingId);
      }

      // Step 4: Redirect to Paystack payment page
      if (paymentData.payment?.authorizationUrl) {
        window.location.href = paymentData.payment.authorizationUrl;
      } else {
        setError("Could not redirect to payment page");
        setPending(false);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("We could not reach the booking service. Please try again.");
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 sm:p-7">
      <div className="space-y-3">
        <p className="section-kicker">Booking</p>
        <h2 className="font-[var(--font-display)] text-[2rem] leading-none text-[#111111] sm:text-3xl md:text-4xl">
          Reserve this vehicle
        </h2>
        <p className="text-sm leading-7 text-[#616161]">
          Choose your pickup and return time. Availability is still checked on
          the server before confirmation, so overlapping reservations stay blocked.
        </p>
      </div>

      {offer ? (
        <div className="mt-5 rounded-[1.2rem] border border-[#ffd7df] bg-[#fff5f7] px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d61032]">
                {offer.tag}
              </p>
              <p className="mt-2 text-base font-semibold text-[#111111]">
                {offer.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6b4a52]">
                {offer.description}
              </p>
            </div>
            <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#d61032]">
              Save {offer.savingsPercent}%
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <label className="field-shell block">
          <span className="field-label">Pickup</span>
          <input
            required
            type="datetime-local"
            name="startDate"
            min={minPickupDate}
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, startDate: event.target.value }))
            }
            className="mt-2 w-full bg-transparent text-sm text-[#111111] outline-none [color-scheme:light]"
          />
        </label>
        <label className="field-shell block">
          <span className="field-label">Return</span>
          <input
            required
            type="datetime-local"
            name="endDate"
            min={form.startDate}
            value={form.endDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, endDate: event.target.value }))
            }
            className="mt-2 w-full bg-transparent text-sm text-[#111111] outline-none [color-scheme:light]"
          />
        </label>
      </div>

      <div className="mt-6 rounded-[1.4rem] border border-[#e2e2e2] bg-[#fafafa] px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#777777]">Booking summary</p>
            <p className="mt-2 text-lg font-semibold text-[#111111]">
              {bookingSummary}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm font-medium text-[#777777]">Estimated total</p>
            {originalTotalPrice ? (
              <p className="mt-2 text-sm font-medium text-[#8d8d8d] line-through">
                {formatCurrency(originalTotalPrice)}
              </p>
            ) : null}
            <p className="mt-2 font-[var(--font-display)] text-3xl leading-none text-[#111111]">
              {formatCurrency(totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="button-primary mt-6 w-full">
        {pending
          ? "Confirming booking..."
          : canBook
            ? "Confirm booking"
            : "Log in to book"}
      </button>
    </form>
  );
}

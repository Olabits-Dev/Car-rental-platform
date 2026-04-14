"use client";

import { useState } from "react";
import type { BookingWithCar } from "@/lib/types";

interface CompleteCheckoutButtonProps {
  booking: BookingWithCar;
}

export function CompleteCheckoutButton({
  booking,
}: CompleteCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentStatus = booking.payment?.status;
  const buttonLabel =
    paymentStatus === "failed" || paymentStatus === "abandoned"
      ? "Retry Checkout"
      : "Complete Checkout";

  const handleCompleteCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize payment
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initialize payment");
      }

      const data = await response.json();
      const paymentId = data.payment?.id;
      const authorizationUrl = data.payment?.authorizationUrl;

      if (paymentId) {
        sessionStorage.setItem("paymentId", paymentId);
        sessionStorage.setItem("bookingId", booking.id);
      }

      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to complete checkout"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-5 space-y-3">
      <button
        onClick={handleCompleteCheckout}
        disabled={isLoading}
        className="w-full rounded-lg bg-[#d61032] px-4 py-3 font-semibold text-white transition-all hover:bg-[#b50929] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : buttonLabel}
      </button>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

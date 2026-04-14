"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams?.get("reference");
        const paymentId = sessionStorage.getItem("paymentId");
        const bookingId = sessionStorage.getItem("bookingId");

        if (!reference || !paymentId) {
          setStatus("failed");
          setMessage("Payment reference not found");
          return;
        }

        const response = await fetch(
          `/api/payments/verify?reference=${reference}&paymentId=${paymentId}`,
          {
            method: "GET",
          },
        );

        const data = await response.json();

        if (data.status === "success" || response.ok) {
          setStatus("success");
          setMessage("Payment successful! Your booking has been confirmed.");

          sessionStorage.removeItem("paymentId");
          sessionStorage.removeItem("bookingId");

          setTimeout(() => {
            router.push(`/dashboard?booking=${bookingId}`);
          }, 2000);
        } else {
          setStatus("failed");
          setMessage(
            data.error || "Payment verification failed. Please contact support.",
          );
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setMessage(
          "An error occurred while verifying your payment. Please contact support.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {status === "loading" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#d61032]"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{message}</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Payment Successful
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Payment Failed
            </h2>
            <p className="mb-6 text-gray-600">{message}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-block rounded bg-[#d61032] px-6 py-2 font-semibold text-white hover:bg-[#b00028]"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

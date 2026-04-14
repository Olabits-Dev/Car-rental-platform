import { Suspense } from "react";
import { PaymentCallbackClient } from "./payment-callback-client";

function PaymentCallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#d61032]"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Processing your payment...
        </h2>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}

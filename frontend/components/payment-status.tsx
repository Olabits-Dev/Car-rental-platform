"use client";

export type PaymentStatusType = "pending" | "success" | "failed" | "abandoned";

export type PaymentStatusProps = {
  status: PaymentStatusType;
  amount: number;
  paymentRef?: string;
  bookingId?: string;
};

const statusConfig: Record<PaymentStatusType, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: string;
}> = {
  pending: {
    label: "Payment Pending",
    bgColor: "bg-[#fff7eb]",
    textColor: "text-[#b45309]",
    icon: "⏳",
  },
  success: {
    label: "Payment Confirmed",
    bgColor: "bg-[#edfdf3]",
    textColor: "text-[#166534]",
    icon: "✓",
  },
  failed: {
    label: "Payment Failed",
    bgColor: "bg-[#fff1f4]",
    textColor: "text-[#d61032]",
    icon: "✕",
  },
  abandoned: {
    label: "Payment Abandoned",
    bgColor: "bg-[#f3f4f6]",
    textColor: "text-[#6b7280]",
    icon: "⊘",
  },
};

export function PaymentStatusIndicator({
  status,
  amount,
  paymentRef,
  bookingId,
}: PaymentStatusProps) {
  const config = statusConfig[status];

  return (
    <div className={`${config.bgColor} rounded-lg p-4 ${config.textColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <p className="font-semibold">{config.label}</p>
            <p className="mt-1 text-sm">
              Amount: ₦{(amount / 100).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {paymentRef && (
              <p className="mt-1 text-xs font-mono">Ref: {paymentRef}</p>
            )}
          </div>
        </div>
        {status === "failed" && bookingId && (
          <a
            href={`/cars`}
            className="text-sm font-semibold underline hover:no-underline"
          >
            Retry
          </a>
        )}
      </div>
    </div>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatusType }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
      {config.label}
    </span>
  );
}

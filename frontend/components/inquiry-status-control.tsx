"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { InquiryStatus } from "@/lib/types";

type InquiryStatusControlProps = {
  inquiryId: string;
  status: InquiryStatus;
};

const statusOptions: InquiryStatus[] = ["new", "in_progress", "resolved"];

const statusLabels: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

export function InquiryStatusControl({
  inquiryId,
  status,
}: InquiryStatusControlProps) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: InquiryStatus) {
    if (nextStatus === status) {
      return;
    }

    setPendingStatus(nextStatus);
    setError(null);

    try {
      await apiClient.updateInquiry(inquiryId, { status: nextStatus });

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Could not update the inquiry.");
      }
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const isActive = option === status;
          const isPending = pendingStatus === option;

          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(pendingStatus)}
              onClick={() => updateStatus(option)}
              className={`rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition ${
                isActive
                  ? "border-[#d61032] bg-[#fff1f4] text-[#d61032]"
                  : "border-[#dddddd] bg-white text-[#666666] hover:border-[#d61032] hover:text-[#d61032]"
              } ${isPending ? "opacity-70" : ""}`}
            >
              {isPending ? "Saving..." : statusLabels[option]}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

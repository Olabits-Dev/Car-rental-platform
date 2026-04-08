"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-[0.9rem] border border-[#d8d8d8] px-4 py-2 text-sm font-semibold text-[#212121] transition hover:border-[#d61032] hover:text-[#d61032]"
      disabled={pending}
    >
      {pending ? "Signing out..." : "Log out"}
    </button>
  );
}

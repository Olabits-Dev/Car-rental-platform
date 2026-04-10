"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { getIsActiveTab, navItems } from "@/components/header-nav";

const menuMeta = {
  book: {
    eyebrow: "Start here",
    description: "Filter cars by city, type, and budget.",
  },
  manage: {
    eyebrow: "Your account",
    description: "See upcoming and past bookings.",
  },
  premium: {
    eyebrow: "Executive fleet",
    description: "View executive and luxury options.",
  },
  deals: {
    eyebrow: "Current offers",
    description: "Open live offers with discount pricing.",
  },
  contact: {
    eyebrow: "Talk to us",
    description: "Reach us for support and car advice.",
  },
} as const;

type MobileNavProps = {
  accountDescription: string;
  accountEyebrow: string;
  accountHref: string;
  accountLabel: string;
};

export function MobileNav({
  accountDescription,
  accountEyebrow,
  accountHref,
  accountLabel,
}: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safePathname = pathname ?? "/";
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsMounted(false);
    }, 240);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isMounted, isVisible]);

  function openMenu() {
    setIsMounted(true);

    window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }

  function closeMenu() {
    setIsVisible(false);
  }

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={openMenu}
        aria-expanded={isMounted}
        aria-controls="mobile-site-menu"
        className="inline-flex min-h-[2.7rem] items-center gap-1.5 rounded-[0.9rem] border border-[#d7d7d7] bg-white px-3.5 text-[0.92rem] font-semibold text-[#1f1f1f] transition hover:border-[#d61032] hover:bg-[#fff6f8] hover:text-[#d61032]"
      >
        <span className="flex flex-col gap-[0.18rem]" aria-hidden="true">
          <span className="h-[2px] w-3.5 rounded-full bg-current" />
          <span className="h-[2px] w-3.5 rounded-full bg-current" />
          <span className="h-[2px] w-3.5 rounded-full bg-current" />
        </span>
        Menu
      </button>

      {isMounted
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close mobile navigation overlay"
                className={`fixed inset-0 z-50 bg-[rgba(17,17,17,0.22)] backdrop-blur-[2px] transition-opacity duration-200 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                onClick={closeMenu}
              />
              <div
                id="mobile-site-menu"
                role="dialog"
                aria-modal="true"
                className={`fixed inset-y-0 right-0 z-[60] w-[min(65vw,24rem)] overflow-hidden border border-[#e7e7e7] bg-white shadow-[0_24px_48px_rgba(15,23,42,0.16)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isVisible ? "translate-x-0" : "translate-x-full"
                } rounded-l-[1.75rem]`}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(214,16,50,0.04),rgba(255,255,255,0)_18%,rgba(255,255,255,1)_38%)]" />
                <div className="relative flex h-full flex-col overflow-y-auto p-3 pt-3.5">
                  <div className="relative rounded-[1.25rem] border border-[#ececec] bg-white/92 p-3.5 pr-14 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <div className="min-w-0">
                      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#d61032]">
                        RideFlex Rentals
                      </p>
                      <h2 className="mt-2 text-[1rem] font-semibold leading-[1.08] text-[#111111]">
                        Browse the fleet faster.
                      </h2>
                      <p className="mt-1.5 text-[0.72rem] leading-4 text-[#666666] max-[390px]:hidden">
                        Main routes and booking actions are grouped here for quick access.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dddddd] bg-white text-lg text-[#111111] transition hover:border-[#d61032] hover:text-[#d61032]"
                      aria-label="Close mobile navigation"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-3 rounded-[1.1rem] border border-[#ececec] bg-[linear-gradient(180deg,#fff8f9_0%,#ffffff_100%)] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#d61032]">
                          Quick start
                        </p>
                        <h3 className="mt-1 text-[0.92rem] font-semibold leading-tight text-[#111111]">
                          Open the live fleet
                        </h3>
                        <p className="mt-1 text-[0.72rem] leading-4 text-[#666666] max-[390px]:hidden">
                          Start with the live fleet, then refine by location, type, or pricing.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#d61032] shadow-[0_6px_16px_rgba(214,16,50,0.08)]">
                        Fleet
                      </span>
                    </div>
                    <Link
                      href="/cars"
                      onClick={closeMenu}
                      className="button-primary mt-2.5 min-h-[2.45rem] w-full text-[0.88rem]"
                    >
                      Show Vehicles
                    </Link>
                  </div>

                  <div className="mt-3">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#818181]">
                      Explore RideFlex
                    </p>
                    <nav className="mt-2 grid gap-1.5">
                      {navItems.map((item) => {
                        const isActive = getIsActiveTab(
                          item.id,
                          safePathname,
                          searchParams,
                        );
                        const meta = menuMeta[item.id];

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeMenu}
                            aria-current={isActive ? "page" : undefined}
                            className={`rounded-[0.95rem] border px-3 py-2.5 transition ${
                              isActive
                                ? "border-[#ffd4dc] bg-[#fff4f6] shadow-[0_10px_24px_rgba(214,16,50,0.08)]"
                                : "border-[#ececec] bg-white hover:border-[#f0c5ce] hover:bg-[#fff8f9]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
                                  {meta.eyebrow}
                                </p>
                                <p
                                  className={`mt-0.5 text-[0.9rem] font-semibold leading-tight ${
                                    isActive ? "text-[#d61032]" : "text-[#171717]"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                <p className="mt-0.5 text-[0.68rem] leading-4 text-[#666666] max-[390px]:hidden">
                                  {meta.description}
                                </p>
                              </div>
                              <span
                                className={`inline-flex h-[1.75rem] w-[1.75rem] shrink-0 items-center justify-center rounded-full border text-sm ${
                                  isActive
                                    ? "border-[#ffd4dc] bg-white text-[#d61032]"
                                    : "border-[#e7e7e7] bg-[#fafafa] text-[#686868]"
                                }`}
                                aria-hidden="true"
                              >
                                &rsaquo;
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="mt-3 rounded-[1.05rem] border border-[#ececec] bg-[#fafafa] p-3">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#8a8a8a]">
                      {accountEyebrow}
                    </p>
                    <p className="mt-1 text-[0.7rem] leading-4 text-[#666666] max-[390px]:hidden">
                      {accountDescription}
                    </p>
                    <Link
                      href={accountHref}
                      onClick={closeMenu}
                      className="button-secondary mt-2.5 min-h-[2.45rem] w-full text-[0.88rem]"
                    >
                      {accountLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

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
        className="inline-flex min-h-[2.7rem] items-center gap-1.5 rounded-[0.9rem] border border-[var(--panel-border-strong)] bg-[var(--panel-solid)] px-3.5 text-[0.92rem] font-semibold text-[var(--secondary-button-text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
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
                className={`fixed inset-y-0 right-0 z-[60] w-[min(65vw,24rem)] overflow-hidden border border-[var(--panel-border)] bg-[var(--panel-solid)] shadow-[0_24px_48px_rgba(15,23,42,0.16)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isVisible ? "translate-x-0" : "translate-x-full"
                } rounded-l-[1.75rem]`}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_8%,transparent),rgba(255,255,255,0)_18%,var(--panel-solid)_38%)]" />
                <div className="relative flex h-full flex-col overflow-y-auto p-3 pt-3.5">
                  <div className="relative rounded-[1.25rem] border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_92%,transparent)] p-3.5 pr-14 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <div className="min-w-0">
                      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                        RideFlex Rentals
                      </p>
                      <h2 className="mt-2 text-[1rem] font-semibold leading-[1.08] text-[var(--heading)]">
                        Browse the fleet faster.
                      </h2>
                      <p className="mt-1.5 text-[0.72rem] leading-4 text-[var(--muted)] max-[390px]:hidden">
                        Main routes and booking actions are grouped here for quick access.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-border-strong)] bg-[var(--panel-solid)] text-lg text-[var(--heading)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      aria-label="Close mobile navigation"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-3 rounded-[1.1rem] border border-[var(--panel-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_6%,var(--panel-solid))_0%,var(--panel-solid)_100%)] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                          Quick start
                        </p>
                        <h3 className="mt-1 text-[0.92rem] font-semibold leading-tight text-[var(--heading)]">
                          Open the live fleet
                        </h3>
                        <p className="mt-1 text-[0.72rem] leading-4 text-[var(--muted)] max-[390px]:hidden">
                          Start with the live fleet, then refine by location, type, or pricing.
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--panel-solid)] px-2 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] shadow-[0_6px_16px_rgba(214,16,50,0.08)]">
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
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
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
                                ? "border-[color-mix(in_srgb,var(--accent)_30%,var(--panel-border))] bg-[var(--accent-soft)] shadow-[0_10px_24px_rgba(214,16,50,0.08)]"
                                : "border-[var(--panel-border)] bg-[var(--panel-solid)] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--panel-border))] hover:bg-[color-mix(in_srgb,var(--accent)_4%,var(--panel-solid))]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--subtle)]">
                                  {meta.eyebrow}
                                </p>
                                <p
                                  className={`mt-0.5 text-[0.9rem] font-semibold leading-tight ${
                                    isActive ? "text-[var(--accent)]" : "text-[var(--heading)]"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                <p className="mt-0.5 text-[0.68rem] leading-4 text-[var(--muted)] max-[390px]:hidden">
                                  {meta.description}
                                </p>
                              </div>
                              <span
                                className={`inline-flex h-[1.75rem] w-[1.75rem] shrink-0 items-center justify-center rounded-full border text-sm ${
                                  isActive
                                    ? "border-[color-mix(in_srgb,var(--accent)_30%,var(--panel-border))] bg-[var(--panel-solid)] text-[var(--accent)]"
                                    : "border-[var(--panel-border)] bg-[var(--panel-soft)] text-[var(--muted)]"
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

                  <div className="mt-3 rounded-[1.05rem] border border-[var(--panel-border)] bg-[var(--panel-soft)] p-3">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
                      {accountEyebrow}
                    </p>
                    <p className="mt-1 text-[0.7rem] leading-4 text-[var(--muted)] max-[390px]:hidden">
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

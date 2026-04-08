import { Suspense } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Logo } from "@/components/logo";

function HeaderNavFallback() {
  return (
    <>
      <nav className="hidden items-center gap-2 lg:flex">
        {["Book", "Manage Trips", "Premium Rentals", "Deals", "Contact"].map((label) => (
          <span
            key={label}
            className="rounded-[0.9rem] px-4 py-2 text-sm font-semibold text-[#212121]"
          >
            {label}
          </span>
        ))}
      </nav>
      <button
        type="button"
        className="inline-flex min-h-[3rem] items-center gap-2 rounded-[0.95rem] border border-[#d7d7d7] bg-white px-4 text-sm font-semibold text-[#1f1f1f] lg:hidden"
      >
        <span className="flex flex-col gap-[0.18rem]" aria-hidden="true">
          <span className="h-[2px] w-4 rounded-full bg-current" />
          <span className="h-[2px] w-4 rounded-full bg-current" />
          <span className="h-[2px] w-4 rounded-full bg-current" />
        </span>
        Menu
      </button>
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dedede] bg-[rgba(255,255,255,0.96)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1 lg:flex-none">
          <Logo />
        </div>
        <div className="hidden flex-1 justify-center lg:flex">
          <Suspense fallback={<HeaderNavFallback />}>
            <HeaderNav />
          </Suspense>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-[0.85rem] border border-[#d7d7d7] px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:border-[#d61032] hover:bg-[#fff6f8] hover:text-[#d61032] lg:inline-flex"
          >
            Sign in or Join
          </Link>
          <div className="hidden lg:block">
            <Link href="/cars" className="button-primary">
              Show Vehicles
            </Link>
          </div>
          <Suspense fallback={<HeaderNavFallback />}>
            <MobileNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

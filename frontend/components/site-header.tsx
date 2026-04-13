import { Suspense } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/session";

function DesktopNavFallback() {
  return (
    <nav className="hidden items-center gap-2 lg:flex">
      {["Book", "Manage Trips", "Premium Rentals", "Deals", "Contact"].map((label) => (
        <span
          key={label}
          className="rounded-[0.9rem] px-4 py-2 text-sm font-semibold text-[var(--heading)]"
        >
          {label}
        </span>
      ))}
    </nav>
  );
}

function MobileNavFallback() {
  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={false}
        aria-controls="mobile-site-menu"
        className="inline-flex min-h-[2.7rem] items-center gap-1.5 rounded-[0.9rem] border border-[var(--panel-border-strong)] bg-[var(--panel-solid)] px-3.5 text-[0.92rem] font-semibold text-[var(--secondary-button-text)] lg:hidden"
      >
        <span className="flex flex-col gap-[0.18rem]" aria-hidden="true">
          <span className="h-[2px] w-3.5 rounded-full bg-current" />
          <span className="h-[2px] w-3.5 rounded-full bg-current" />
          <span className="h-[2px] w-3.5 rounded-full bg-current" />
        </span>
        Menu
      </button>
    </div>
  );
}

function getAccountCta(role?: string) {
  if (role === "owner") {
    return {
      href: "/dashboard",
      label: "Admin Dashboard",
      eyebrow: "Admin access",
      description: "Open the admin dashboard to track bookings, members, and inquiries.",
    };
  }

  if (role === "agent") {
    return {
      href: "/dashboard",
      label: "Agent Dashboard",
      eyebrow: "Agent access",
      description: "Open the agent dashboard to manage customer follow-ups and trips.",
    };
  }

  if (role === "member") {
    return {
      href: "/dashboard",
      label: "Member Dashboard",
      eyebrow: "Your dashboard",
      description: "Open your dashboard to view bookings, trips, and account activity.",
    };
  }

  return {
    href: "/login",
    label: "Sign in or Join",
    eyebrow: "Customer access",
    description: "Sign in to manage trips and move through checkout faster.",
  };
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const accountCta = getAccountCta(user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--panel-border)] bg-[var(--header-bg)] backdrop-blur-xl transition-colors">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1 lg:flex-none">
          <Logo />
        </div>
        <div className="hidden flex-1 justify-center lg:flex">
          <Suspense fallback={<DesktopNavFallback />}>
            <HeaderNav />
          </Suspense>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div>
            <ThemeToggle compact />
          </div>
          <Link
            href={accountCta.href}
            className="hidden rounded-[0.85rem] border border-[var(--panel-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--secondary-button-text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] lg:inline-flex"
          >
            {accountCta.label}
          </Link>
          <div className="hidden lg:block">
            <Link href="/cars" className="button-primary">
              Show Vehicles
            </Link>
          </div>
          <Suspense fallback={<MobileNavFallback />}>
            <MobileNav
              accountDescription={accountCta.description}
              accountEyebrow={accountCta.eyebrow}
              accountHref={accountCta.href}
              accountLabel={accountCta.label}
            />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

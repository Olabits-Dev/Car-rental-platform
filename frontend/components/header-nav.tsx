"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const navItems = [
  { id: "book", href: "/cars", label: "Book" },
  { id: "manage", href: "/dashboard", label: "Manage Trips" },
  { id: "premium", href: "/cars?type=Luxury", label: "Premium Rentals" },
  { id: "deals", href: "/deals", label: "Deals" },
  { id: "contact", href: "/contact", label: "Contact" },
] as const;

export function getIsActiveTab(
  itemId: string,
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  const type = searchParams?.get("type");
  const offer = searchParams?.get("offer");

  if (itemId === "manage") {
    return pathname.startsWith("/dashboard");
  }

  if (itemId === "deals") {
    return pathname.startsWith("/deals") || Boolean(offer);
  }

  if (itemId === "contact") {
    return pathname.startsWith("/contact");
  }

  if (!pathname.startsWith("/cars")) {
    return false;
  }

  if (itemId === "premium") {
    return pathname === "/cars" && type === "Luxury";
  }

  return type !== "Luxury" && !offer;
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safePathname = pathname ?? "/";

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {navItems.map((item) => {
        const isActive = getIsActiveTab(item.id, safePathname, searchParams);

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-[#fff1f4] text-[#d61032] shadow-[inset_0_-2px_0_#d61032]"
                : "text-[#212121] hover:bg-[#fff6f8] hover:text-[#d61032]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

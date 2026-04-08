import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex min-w-0 items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#111111]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.85rem] bg-[#d61032] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(214,16,50,0.18)]">
        RF
      </span>
      <span className="min-w-0 max-w-[11.75rem] sm:max-w-none">
        <span className="block truncate text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#111111] lg:hidden">
          RideFlex Rentals
        </span>
        <span className="mt-0.5 block truncate text-[0.62rem] tracking-normal text-[#6b6b6b] lg:hidden">
          Friendly car hire for city and premium trips
        </span>
        <span className="hidden text-xs uppercase text-[#111111] lg:inline">
          RideFlex Rentals
        </span>
      </span>
    </Link>
  );
}

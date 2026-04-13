import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Car } from "@/lib/types";

type CarCardProps = {
  car: Car;
};

export function CarCard({ car }: CarCardProps) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-[#e0e0e0] bg-white shadow-[0_16px_34px_rgba(17,24,39,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(17,24,39,0.1)]"
    >
      <div className="relative h-[220px] overflow-hidden bg-[#efefef] sm:h-[260px]">
        <Image
          src={car.heroImage}
          alt={car.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#111111] shadow-[0_8px_18px_rgba(17,24,39,0.08)]">
            {car.type}
          </span>
        </div>
        <div className="absolute right-4 top-4 rounded-[1rem] bg-[rgba(17,17,17,0.86)] px-3 py-2 text-right text-white">
          <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#d5d5d5]">
            From
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(car.pricePerDay)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:gap-6 sm:p-6">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#d61032]">
            {car.brand}
          </p>
          <h3 className="mt-3 font-[var(--font-display)] text-[1.8rem] leading-none tracking-[-0.03em] text-[#111111] sm:text-[2rem]">
            {car.name}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#616161]">{car.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#777777]">
              Location
            </p>
            <p className="mt-1 font-semibold text-[#111111]">{car.location}</p>
          </div>
          <div className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#777777]">
              Seats
            </p>
            <p className="mt-1 font-semibold text-[#111111]">{car.seats}</p>
          </div>
          <div className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#777777]">
              Fuel
            </p>
            <p className="mt-1 font-semibold text-[#111111]">{car.fuel}</p>
          </div>
          <div className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#777777]">
              Rating
            </p>
            <p className="mt-1 font-semibold text-[#111111]">{car.rating}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#ededed] pt-4">
          <p className="text-sm text-[#616161]">{car.trips}+ completed trips</p>
          <span className="inline-flex items-center rounded-[0.9rem] bg-[#d61032] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[#b30828]">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}

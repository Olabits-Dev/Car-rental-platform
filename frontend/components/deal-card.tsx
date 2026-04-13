import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { DealOffer } from "@/lib/types";

type DealCardProps = {
  offer: DealOffer;
};

export function DealCard({ offer }: DealCardProps) {
  return (
    <article className="glass-panel flex h-full min-h-[34rem] flex-col overflow-hidden p-0 md:min-h-[38rem]">
      <div className="relative h-[18rem] overflow-hidden bg-[#efefef] md:h-[22rem]">
        <Image
          src={offer.car.heroImage}
          alt={offer.car.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.08),rgba(17,17,17,0.16)_36%,rgba(17,17,17,0.76)_100%)]" />
        <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#d61032] shadow-[0_8px_18px_rgba(17,24,39,0.08)]">
          {offer.tag}
        </div>
        <div className="absolute right-4 top-4 rounded-[0.9rem] bg-[#111111]/86 px-3 py-2 text-sm font-semibold text-white">
          Save {offer.savingsPercent}%
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="max-w-[24rem] text-white">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/76">
              {offer.car.brand}
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-[1.9rem] leading-none tracking-[-0.03em] text-white md:text-[2.2rem]">
              {offer.car.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/82">
              {offer.description}
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <p className="font-[var(--font-display)] text-4xl leading-none text-white">
                {formatCurrency(offer.salePricePerDay)}
              </p>
              <p className="pb-1 text-sm font-medium text-white/58 line-through">
                {formatCurrency(offer.car.pricePerDay)}
              </p>
            </div>
            <p className="mt-2 text-sm text-white/74">
              Save {formatCurrency(offer.savingsPerDay)} per day on this vehicle.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-wrap gap-2">
          <span className="luxury-chip">{offer.car.location}</span>
          <span className="luxury-chip">{offer.code}</span>
          <span className="luxury-chip">{offer.title}</span>
        </div>

        <div className="grid min-h-[7.5rem] gap-2">
          {offer.benefits.map((benefit) => (
            <div
              key={benefit}
              className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-3 text-sm text-[#3a3a3a]"
            >
              {benefit}
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-[1rem] bg-[#fff5f7] px-4 py-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#d61032]">
              Offer code
            </p>
            <p className="mt-1 text-base font-semibold text-[#111111]">
              {offer.code}
            </p>
          </div>
          <Link
            href={`/cars/${offer.car.id}?offer=${offer.code}`}
            className="button-primary"
          >
            View deal
          </Link>
        </div>
      </div>
    </article>
  );
}

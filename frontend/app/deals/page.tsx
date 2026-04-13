import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DealCard } from "@/components/deal-card";
import { formatCurrency } from "@/lib/format";
import { getLocations } from "@/lib/store";
import { getDealOffers } from "@/lib/store";

export const metadata: Metadata = {
  title: "Deals",
  description:
    "Browse current discounted rental offers with deal pricing that flows directly into booking.",
};

const workflowSteps = [
  {
    title: "Choose a deal",
    copy: "Start from curated offers instead of the full inventory when price is the main priority.",
  },
  {
    title: "Open the matching car",
    copy: "Each deal links to the correct vehicle page with the offer already attached.",
  },
  {
    title: "Book with the discount applied",
    copy: "The lower rate carries into the booking summary and final reservation total.",
  },
];

export default function DealsPage() {
  const offers = getDealOffers();
  const heroOffer = offers[0];
  const locations = getLocations();

  return (
    <div className="page-shell py-6 md:py-8">
      <section className="grid items-stretch gap-6 lg:min-h-[calc(100svh-8.5rem)] lg:grid-cols-[0.98fr_1.02fr]">
        <div className="glass-panel flex h-full flex-col p-6 md:p-8">
          <p className="section-kicker">Rental deals</p>
          <h1 className="section-heading mt-4">
            Limited-rate offers with a direct path into booking.
          </h1>
          <p className="section-copy mt-4 max-w-2xl">
            Deals now have their own workflow instead of behaving like another
            generic inventory filter. Pick an offer, open the matching vehicle,
            and keep the discounted rate through booking.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className={`flex min-h-[8.75rem] flex-col rounded-[1.2rem] border border-[#e6e6e6] bg-[#fafafa] px-4 py-4 ${
                  index === workflowSteps.length - 1 ? "md:col-span-2 2xl:col-span-1" : ""
                }`}
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#d61032]">
                  Step {index + 1}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#111111]">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#616161]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <Link href="/cars" className="button-secondary">
              Browse full fleet
            </Link>
            <Link href={`/cars/${heroOffer.car.id}?offer=${heroOffer.code}`} className="button-primary">
              Start with top deal
            </Link>
          </div>
        </div>

        <div className="glass-panel h-full overflow-hidden p-0">
          <div className="relative h-full min-h-[360px] md:min-h-[440px] lg:min-h-0">
            <Image
              src={heroOffer.car.heroImage}
              alt={heroOffer.car.imageAlt}
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.08),rgba(17,17,17,0.18)_34%,rgba(17,17,17,0.78)_100%)]" />
            <div className="absolute left-6 top-6 flex flex-wrap gap-3 md:left-8 md:top-8">
              <span className="rounded-full bg-white/92 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#d61032] shadow-[0_10px_22px_rgba(17,24,39,0.12)]">
                Top deal this week
              </span>
              <span className="rounded-full bg-[#111111]/86 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white">
                Save {heroOffer.savingsPercent}%
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="max-w-2xl text-white">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/76">
                  {heroOffer.car.brand}
                </p>
                <h2 className="mt-3 font-[var(--font-display)] text-4xl leading-none tracking-[-0.03em] text-white md:text-5xl">
                  {heroOffer.car.name}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 md:text-base md:leading-7">
                  {heroOffer.description}
                </p>
                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <p className="font-[var(--font-display)] text-4xl leading-none text-white md:text-5xl">
                    {formatCurrency(heroOffer.salePricePerDay)}
                  </p>
                  <p className="pb-1 text-base font-medium text-white/60 line-through">
                    {formatCurrency(heroOffer.car.pricePerDay)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/24 bg-white/14 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {heroOffer.car.location}
                  </span>
                  <span className="rounded-full border border-white/24 bg-white/14 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {heroOffer.code}
                  </span>
                  <span className="rounded-full border border-white/24 bg-white/14 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {heroOffer.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Current offers</p>
            <h2 className="section-heading mt-3">
              Discounts that map to a real reservation flow.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {locations.slice(0, 5).map((location) => (
              <span key={location} className="luxury-chip">
                {location}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {offers.map((offer) => (
            <DealCard key={offer.code} offer={offer} />
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { CarCard } from "@/components/car-card";
import { CarGallery } from "@/components/car-gallery";
import { formatBookingWindow, formatCurrency } from "@/lib/format";
import { getFirstValue, type SearchParamRecord } from "@/lib/query";
import { getCurrentUser } from "@/lib/session";
import {
  getCarById,
  getDealOfferByCode,
  getRelatedCars,
  getUpcomingBookingsForCar,
} from "@/lib/store";

type CarDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParamRecord>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CarDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);

  if (!car) {
    return {
      title: "Car Not Found",
    };
  }

  return {
    title: car.name,
    description: `${car.summary} Available in ${car.location} from ${formatCurrency(
      car.pricePerDay,
    )} per day.`,
  };
}

export default async function CarDetailsPage({
  params,
  searchParams,
}: CarDetailsPageProps) {
  const { id } = await params;
  const car = getCarById(id);

  if (!car) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const reservedSlots = getUpcomingBookingsForCar(car.id);
  const relatedCars = getRelatedCars(car, 3);
  const offerCode = getFirstValue((await searchParams).offer);
  const dealOffer = getDealOfferByCode(offerCode);
  const activeOffer = dealOffer?.car.id === car.id ? dealOffer : null;

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#666666] md:mb-8">
        <Link href="/cars" className="transition hover:text-[#d61032]">
          Cars
        </Link>
        <span>/</span>
        <span className="font-medium text-[#111111]">{car.name}</span>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_400px]">
        <div className="space-y-8">
          <CarGallery
            brand={car.brand}
            name={car.name}
            description={car.description}
            pricePerDay={car.pricePerDay}
            gallery={car.gallery}
          />

          <div className="space-y-6 lg:hidden">
            <BookingForm
              carId={car.id}
              pricePerDay={car.pricePerDay}
              canBook={Boolean(currentUser)}
              offer={activeOffer}
            />
            {!currentUser ? (
              <div className="glass-panel p-5 text-sm leading-6 text-[#616161]">
                You can still browse availability without an account. Sign in when
                you are ready to confirm and save the booking to your dashboard.
              </div>
            ) : null}
          </div>

          <div className="glass-panel overflow-hidden p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="section-kicker">Vehicle overview</p>
                <h2 className="section-heading mt-4">
                  Built for reliable rental days and simpler trip planning
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#616161]">
                  {car.summary}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                { label: "Location", value: car.location },
                { label: "Seats", value: `${car.seats}` },
                { label: "Transmission", value: car.transmission },
                { label: "Fuel", value: car.fuel },
                { label: "Model year", value: `${car.year}` },
                { label: "Range", value: car.range },
                { label: "Trips", value: `${car.trips}+` },
                { label: "Rating", value: `${car.rating}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-4"
                >
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[#777777]">
                    {item.label}
                  </p>
                  <p className="mt-2 font-medium text-[#111111]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-panel p-7">
              <p className="section-kicker">Included features</p>
              <div className="mt-5 grid gap-3">
                {car.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-4 text-sm font-medium text-[#333333]"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-7">
              <p className="section-kicker">Upcoming availability</p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl leading-none text-[#111111] md:text-4xl">
                Reserved time slots
              </h2>
              <div className="mt-5 grid gap-3">
                {reservedSlots.length > 0 ? (
                  reservedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="rounded-[1rem] border border-[#ffe1e7] bg-[#fff5f7] px-4 py-4 text-sm leading-6 text-[#5b1f2a]"
                    >
                      {formatBookingWindow(slot.startDate, slot.endDate)}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-4 text-sm text-[#616161]">
                    No upcoming reservations for this car yet. It is fully open.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden space-y-6 lg:block">
          <BookingForm
            carId={car.id}
            pricePerDay={car.pricePerDay}
            canBook={Boolean(currentUser)}
            offer={activeOffer}
          />
          {!currentUser ? (
            <div className="glass-panel p-5 text-sm leading-6 text-[#616161]">
              You can still browse availability without an account. Sign in when
              you are ready to confirm and save the booking to your dashboard.
            </div>
          ) : null}
        </aside>
      </section>

      {relatedCars.length > 0 ? (
        <section className="mt-20">
          <div className="mb-8">
            <p className="section-kicker">Similar options</p>
            <h2 className="section-heading mt-3">More cars in this category</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {relatedCars.map((relatedCar) => (
              <CarCard key={relatedCar.id} car={relatedCar} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

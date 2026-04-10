import type { Metadata } from "next";
import Image from "next/image";
import { CarCard } from "@/components/car-card";
import { EmptyState } from "@/components/empty-state";
import { FilterForm } from "@/components/filter-form";
import { normalizeCarFilters, type SearchParamRecord } from "@/lib/query";
import { getCarTypes, getLocations, listCars } from "@/lib/store";

type CarsPageProps = {
  searchParams: Promise<SearchParamRecord>;
};

export const metadata: Metadata = {
  title: "Browse Cars",
  description:
    "Filter available rental cars by city, type, and daily price range.",
};

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const filters = normalizeCarFilters(await searchParams);
  const filteredCars = listCars(filters);
  const allCars = listCars();
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const heroCar = filteredCars[0] ?? allCars[0];

  return (
    <div className="page-shell py-8 md:py-10">
      <section className="space-y-8">
        <div className="glass-panel overflow-hidden p-0">
          <div className="grid lg:grid-cols-[1fr_420px]">
            <div className="p-6 md:p-10">
              <p className="section-kicker">Browse vehicles</p>
              <h1 className="section-heading mt-4">
                Compare available cars by city, category, and price.
              </h1>
              <p className="section-copy mt-4 max-w-2xl">
                The browse experience now follows a clearer rental pattern:
                practical filters up front, simpler cards, and direct movement into
                vehicle detail and booking.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["SUV", "Luxury", "Sedan", "Electric", "Van"].map((item) => (
                  <span key={item} className="luxury-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[260px] border-t border-[#ececec] lg:min-h-[280px] lg:border-l lg:border-t-0">
              <Image
                src={heroCar.heroImage}
                alt={heroCar.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.02),rgba(17,17,17,0.16)_44%,rgba(17,17,17,0.74)_100%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d61032]">
                  Featured now
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
                  {heroCar.name}
                </p>
                <p className="mt-1 text-sm text-white/82 md:text-base">{heroCar.location}</p>
              </div>
            </div>
          </div>
        </div>

        <FilterForm
          initialFilters={filters}
          locations={getLocations()}
          types={getCarTypes()}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#555555]">
              Showing{" "}
              <span className="font-semibold text-[#111111]">{filteredCars.length}</span>{" "}
              of {allCars.length} vehicles
            </p>
            <p className="mt-1 text-sm text-[#777777]">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`
                : "No filters active"}
            </p>
          </div>
        </div>

        {filteredCars.length === 0 ? (
          <EmptyState
            title="No cars match those filters"
            description="Try expanding your budget, changing the pickup city, or clearing the current filters to see the full inventory."
            actionHref="/cars"
            actionLabel="Show all cars"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

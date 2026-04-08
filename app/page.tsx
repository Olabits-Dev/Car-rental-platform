import Image from "next/image";
import Form from "next/form";
import Link from "next/link";
import { CarCard } from "@/components/car-card";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { formatCurrency } from "@/lib/format";
import { getCarTypes, getFeaturedCars, getLocations, listCars } from "@/lib/store";

const trustPoints = [
  {
    title: "We help you get moving faster",
    copy: "Tell us where you are headed, what kind of car you want, and your budget, and we will help you get to the right option quickly.",
  },
  {
    title: "Cars that fit real plans",
    copy: "From quick errands and airport pickups to business travel and family weekends, you can compare the vehicles that match the way you travel.",
  },
  {
    title: "Bookings you can count on",
    copy: "We keep availability checks in place before confirmation, so when you reserve a car you can feel more confident it is truly ready for you.",
  },
];

const popularBrands = [
  "Toyota",
  "Peugeot",
  "Honda",
  "Kia",
  "BMW",
  "Mercedes-Benz",
] as const;

type PopularBrand = (typeof popularBrands)[number];

function BrandMark({ brand }: { brand: PopularBrand }) {
  if (brand === "Toyota") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="9" ry="6.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <ellipse cx="12" cy="12" rx="2.8" ry="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <ellipse cx="12" cy="12" rx="5.4" ry="2.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  if (brand === "Peugeot") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
        <path
          d="M12 2.8 18.4 5v5.5c0 4.3-2.6 8.1-6.4 10.7C8.2 18.6 5.6 14.8 5.6 10.5V5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M10 15.8V8.4h3.1a2 2 0 1 1 0 4H10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (brand === "Honda") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
        <rect x="4.8" y="3.8" width="14.4" height="16.4" rx="3.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8.7 8.2v7.6M15.3 8.2v7.6M8.7 12h6.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (brand === "Kia") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
        <path
          d="M4.6 15.8 8.4 8.2M8.4 12l3.6-3.8M12 8.2h7.2l-5.4 7.6H19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (brand === "BMW") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
        <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="4.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 7.3v9.4M7.3 12h9.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 7.3a4.7 4.7 0 0 1 4.7 4.7H12zM7.3 12A4.7 4.7 0 0 1 12 7.3V12z" fill="currentColor" opacity="0.22" />
        <path d="M12 16.7A4.7 4.7 0 0 1 7.3 12H12zM16.7 12A4.7 4.7 0 0 1 12 16.7V12z" fill="currentColor" opacity="0.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 5.8v10.8M12 5.8l4.6 8M12 5.8l-4.6 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const featuredCars = getFeaturedCars(5);
  const featuredGridCars = featuredCars.slice(0, 3);
  const allCars = listCars();
  const locations = getLocations();
  const carTypes = getCarTypes();
  const secondaryFeatureCar = featuredCars[1] ?? featuredCars[0];
  const heroCar =
    allCars.find((car) => car.id === "toyota-fortuner-gx") ?? featuredCars[0];
  const startingPrice = Math.min(...allCars.map((car) => car.pricePerDay));

  return (
    <div className="page-shell pt-2 pb-8 md:pt-3 md:pb-10">
      <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#0d1520]">
        <div className="absolute inset-0">
          <Image
            src={heroCar.heroImage}
            alt={heroCar.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,13,21,0.9)_0%,rgba(7,13,21,0.72)_34%,rgba(7,13,21,0.28)_66%,rgba(7,13,21,0.54)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,167,62,0.18)_0%,rgba(255,167,62,0)_28%,rgba(7,13,21,0.18)_64%,rgba(7,13,21,0.72)_100%)]" />
        </div>

        <div className="relative flex min-h-[32.5rem] flex-col p-5 text-white sm:min-h-[34rem] sm:p-6 lg:min-h-[min(40rem,calc(100vh-6.8rem))] lg:px-8 lg:py-7 xl:min-h-[min(41rem,calc(100vh-7rem))]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/14 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-sm font-semibold text-white">
                RF
              </span>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/78">
                  RideFlex Rentals
                </p>
                <p className="mt-0.5 text-sm text-white/90">
                  Nigeria-ready car hire
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                Support
              </span>
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                NGN
              </span>
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                25+ Driver guide
              </span>
            </div>
          </div>

          <div className="mt-7 max-w-[min(82rem,84vw)] sm:mt-9 lg:mt-10">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#ffd3bf]">
              Welcome to RideFlex
            </p>
            <h1 className="home-title mt-4 max-w-[18.2ch] text-[clamp(2.55rem,4.15vw,5rem)] text-white">
              Find the right car for city trips, airport pickups, and longer drives.
            </h1>
            <p className="mt-4 max-w-[56rem] text-[0.96rem] leading-[1.65] text-white/82 md:text-[1.01rem]">
              Compare everyday cars, executive rides, SUVs, and vans with local
              rates, fast search, and protected availability before you book.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                4.9/5 from returning drivers
              </span>
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                Rates from {formatCurrency(startingPrice)}/day
              </span>
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                Lagos, Abuja, Port Harcourt
              </span>
            </div>
          </div>

          <div className="mt-5 lg:mt-6">
            <Form
              action="/cars"
              className="grid gap-2 rounded-[1.9rem] border border-white/35 bg-white/96 p-2 shadow-[0_28px_48px_rgba(7,13,21,0.24)] backdrop-blur-md lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
            >
              <label className="flex min-w-0 flex-col justify-center gap-1 rounded-[1.2rem] px-4 py-3 lg:rounded-none lg:border-r lg:border-[#ececec] lg:px-5 lg:py-2.5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6e6e6e]">
                  Pick-up location
                </span>
                <select name="location" className="field-input hero-field-input text-[1rem] font-semibold text-[#1c1c1c]">
                  <option value="">All destinations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col justify-center gap-1 rounded-[1.2rem] px-4 py-3 lg:rounded-none lg:border-r lg:border-[#ececec] lg:px-5 lg:py-2.5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6e6e6e]">
                  Vehicle type
                </span>
                <select name="type" className="field-input hero-field-input text-[1rem] font-semibold text-[#1c1c1c]">
                  <option value="">All categories</option>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col justify-center gap-1 rounded-[1.2rem] px-4 py-3 lg:rounded-none lg:border-r lg:border-[#ececec] lg:px-5 lg:py-2.5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6e6e6e]">
                  Keyword
                </span>
                <input
                  name="query"
                  placeholder="Toyota, SUV, electric..."
                  className="field-input hero-field-input text-[1rem] font-semibold text-[#1c1c1c]"
                />
              </label>

              <label className="flex min-w-0 flex-col justify-center gap-1 rounded-[1.2rem] px-4 py-3 lg:rounded-none lg:border-r lg:border-[#ececec] lg:px-5 lg:py-2.5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6e6e6e]">
                  Max price/day
                </span>
                <input
                  type="number"
                  min={20000}
                  step={5000}
                  name="maxPrice"
                  placeholder="Any budget"
                  className="field-input hero-field-input text-[1rem] font-semibold text-[#1c1c1c]"
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-[4rem] items-center justify-center rounded-[1.35rem] bg-[#d61032] px-6 text-[0.98rem] font-semibold text-white shadow-[0_16px_28px_rgba(214,16,50,0.24)] transition hover:translate-y-[-1px] hover:bg-[#b30828] lg:min-h-[3.5rem]"
              >
                Search
              </button>
            </Form>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72">
                Brands customers ask for most
              </span>
              {popularBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:gap-2 sm:text-[0.68rem]"
                >
                  <span className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border border-white/18 bg-white/10 text-white sm:h-5 sm:w-5">
                    <BrandMark brand={brand} />
                  </span>
                  <span>{brand}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="glass-panel flex h-full flex-col p-6 md:p-7 lg:p-6">
          <p className="section-kicker">Why customers choose us</p>
          <h2 className="home-title mt-3 max-w-[15.5ch] text-[clamp(1.85rem,2.45vw,2.55rem)] text-[#121212]">
            We keep booking simple so your trip feels easier from the start.
          </h2>
          <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-[1.15rem] border border-[#e2e2e2] bg-[#fafafa] px-3.5 py-3.5 lg:last:col-span-2"
              >
                <h3 className="text-[0.96rem] font-semibold leading-snug text-[#111111]">
                  {point.title}
                </h3>
                <p className="mt-1.5 text-[0.84rem] leading-[1.55] text-[#616161]">
                  {point.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2.5 md:grid-cols-3">
            <div className="stat-card min-h-[7.8rem] gap-2.5 p-3.5">
              <p className="stat-value">{allCars.length}</p>
              <p className="stat-label">Vehicles ready to book</p>
            </div>
            <div className="stat-card min-h-[7.8rem] gap-2.5 p-3.5">
              <p className="stat-value">{locations.length}</p>
              <p className="stat-label">Cities we serve</p>
            </div>
            <div className="stat-card stat-card-currency min-h-[7.8rem] gap-2.5 p-3.5">
              <p className="stat-value stat-value-currency">{formatCurrency(startingPrice)}</p>
              <p className="stat-label">Rates from</p>
            </div>
          </div>
        </div>

        <HomeHeroCarousel cars={featuredCars} />
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">Cars customers love</p>
            <h2 className="home-title mt-3 text-[clamp(2.1rem,4vw,4rem)] text-[#121212]">
              Start with a few favorites for daily drives, airport pickups, business travel, and family plans.
            </h2>
          </div>
          <Link href="/cars" className="button-secondary w-fit">
            See full fleet
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
          {carTypes.map((type) => (
            <span
              key={type}
              className="luxury-chip min-w-0 justify-center px-2 py-2 text-[0.56rem] tracking-[0.1em] sm:min-w-fit sm:px-[0.95rem] sm:py-[0.55rem] sm:text-[0.72rem] sm:tracking-[0.16em]"
            >
              <span className="truncate">{type}</span>
            </span>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredGridCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="dark-panel p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8ea0]">
            Your trips, all in one place
          </p>
          <h2 className="home-title mt-4 text-4xl text-white md:text-5xl">
            Book today, check details later, and come back whenever you need.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d5d5d5]">
            Once you sign in, your reservations, trip dates, and booking details stay
            together in one dashboard, so it is easier to manage plans and return for
            your next rental.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="button-primary">
              Manage trips
            </Link>
            <Link href="/login" className="button-secondary border-white/35 bg-white text-[#111111]">
              Sign in
            </Link>
          </div>
        </div>

        <div className="glass-panel overflow-hidden p-0">
          <div className="relative min-h-[260px]">
            <Image
              src={secondaryFeatureCar.heroImage}
              alt={secondaryFeatureCar.imageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.02),rgba(17,17,17,0.58))]" />
            <div className="absolute left-6 top-6 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d61032]">
              Available in {secondaryFeatureCar.location}
            </div>
          </div>
          <div className="p-7 md:p-8">
            <p className="section-kicker">Where we serve</p>
            <h2 className="home-title mt-3 text-3xl text-[#111111] md:text-4xl">
              Pick up in the cities you know and travel at your own pace.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {locations.map((location) => (
                <span key={location} className="luxury-chip">
                  {location}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

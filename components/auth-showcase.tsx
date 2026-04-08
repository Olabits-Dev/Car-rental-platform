import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { getFeaturedCars } from "@/lib/store";

type AuthShowcaseProps = {
  mode: "login" | "register";
};

const showcaseContent = {
  login: {
    badge: "Customer access",
    title: "Sign in and keep every booking, driver detail, and upcoming trip in one place.",
    description:
      "Account access should feel polished and reassuring. Review confirmed reservations, jump back into repeat rentals, and move into booking faster without re-entering the basics.",
    highlights: [
      "Dashboard access for upcoming and past bookings",
      "Faster repeat reservations with one saved account",
      "Protected availability checks before confirmation",
    ],
  },
  register: {
    badge: "Join RideFlex",
    title: "Create one account and make each future rental feel shorter, clearer, and easier.",
    description:
      "New customers get immediate account access after registration, a cleaner path into booking, and a single place to manage trips, pricing, and reservation details over time.",
    highlights: [
      "Automatic sign-in right after account creation",
      "Cleaner checkout flow for future reservations",
      "One dashboard for every trip and booking update",
    ],
  },
} as const;

export function AuthShowcase({ mode }: AuthShowcaseProps) {
  const featuredCars = getFeaturedCars(2);
  const primaryCar = featuredCars[0];
  const showcaseCar = mode === "register" ? featuredCars[1] ?? primaryCar : primaryCar;
  const content = showcaseContent[mode];

  if (!showcaseCar) {
    return null;
  }

  return (
    <aside className="dark-panel h-full overflow-hidden p-0">
      <div className="flex h-full min-h-[460px] flex-col md:min-h-[540px]">
        <div className="border-b border-white/10 px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/92 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#d61032] shadow-[0_10px_24px_rgba(17,24,39,0.16)]">
                {content.badge}
              </span>
              <span className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                {showcaseCar.location}
              </span>
            </div>

            <div className="rounded-[1.15rem] border border-white/14 bg-[#090909]/36 px-4 py-3 text-right text-white backdrop-blur-md">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                Featured daily rate
              </p>
              <p className="mt-2 font-[var(--font-display)] text-3xl leading-none">
                {formatCurrency(showcaseCar.pricePerDay)}
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/68">
              {showcaseCar.brand} {showcaseCar.model}
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl leading-[0.95] tracking-[-0.04em] text-white sm:text-4xl md:text-[3.2rem]">
              {content.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 md:text-base">
              {content.description}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {content.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-sm leading-6 text-white/84 backdrop-blur-sm"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[220px] flex-1 md:min-h-[260px]">
          <Image
            src={showcaseCar.heroImage}
            alt={showcaseCar.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.08),rgba(9,9,11,0.18)_32%,rgba(9,9,11,0.78)_100%)]" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-xl">
              <h3 className="font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em] text-white md:text-4xl">
                {showcaseCar.name}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
                {showcaseCar.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {showcaseCar.type}
                </span>
                <span className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {showcaseCar.transmission}
                </span>
                <span className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {showcaseCar.seats} seats
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

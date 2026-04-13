import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dddddd] bg-white text-[#111111]">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-8">
          <div className="space-y-2.5">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#d61032] sm:text-sm sm:tracking-[0.24em]">
              RideFlex Rentals
            </p>
            <p className="max-w-xl text-[0.92rem] leading-6 text-[#616161] sm:text-sm sm:leading-7">
              Car rental booking inspired by practical travel sites: quick search,
              protected availability, cleaner browse flows, and a fleet built for
              city pickups, airport runs, and longer road trips.
            </p>
          </div>

          <div className="grid gap-5 min-[380px]:grid-cols-2 lg:contents">
            <div>
              <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#262626] sm:text-sm">
                Popular vehicle types
              </p>
              <div className="mt-3 grid grid-cols-[max-content_max-content] gap-x-6 gap-y-2">
                {["SUV", "Luxury", "Sedan", "Electric", "Van"].map((item) => (
                  <p
                    key={item}
                    className="text-[0.84rem] leading-5 text-[#616161] sm:text-sm sm:leading-6"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#262626] sm:text-sm">
                Contact RideFlex
              </p>
              <div className="mt-3 grid gap-2 text-[0.84rem] leading-5 text-[#616161] sm:text-sm sm:leading-6">
                <p className="break-words">hello@rideflexrentals.com</p>
                <p>Mon - Sat, 8:00 AM to 7:00 PM</p>
                <Link
                  href="/contact"
                  className="button-secondary inline-flex min-h-[2.2rem] rounded-[0.8rem] px-3 text-[0.625rem]"
                >
                  Contact us
                </Link>
                <p>Support for bookings and vehicle selection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

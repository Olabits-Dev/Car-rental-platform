import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { getCarTypes, getLocations } from "@/lib/store";

export const metadata: Metadata = {
  title: "Contact RideFlex",
  description:
    "Get in touch with RideFlex about car rentals, booking support, and vehicle availability.",
};

const supportPoints = [
  {
    title: "Talk to us about the right car",
    copy: "Tell us whether you need a city car, SUV, business sedan, airport pickup, or family option and we will help you narrow it down.",
  },
  {
    title: "Get help before you book",
    copy: "If you are unsure about timing, location, or availability, our team can guide you before you move into reservation.",
  },
  {
    title: "Hear back quickly",
    copy: "Most customer requests receive a response within one business day, often much sooner during active hours.",
  },
];

export default function ContactPage() {
  const locations = getLocations();
  const vehicleTypes = getCarTypes();

  return (
    <div className="page-shell py-8 md:py-12">
      <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6 md:p-10">
          <p className="section-kicker">Contact RideFlex</p>
          <h1 className="section-heading mt-4">
            Need help finding the right car or confirming a booking plan?
          </h1>
          <p className="section-copy mt-4 max-w-2xl">
            Our team is here to help with vehicle suggestions, availability
            questions, trip planning, and booking support before you reserve.
          </p>

          <div className="mt-8 grid gap-4">
            {supportPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-[1.3rem] border border-[#e6e6e6] bg-[#fafafa] px-4 py-4 sm:px-5 sm:py-5"
              >
                <h2 className="text-lg font-semibold text-[#111111]">
                  {point.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#616161]">
                  {point.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[#e6e6e6] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#d61032]">
                Email support
              </p>
              <p className="mt-3 text-[clamp(0.98rem,1.25vw,1.32rem)] font-semibold leading-[1.18] text-[#111111] [overflow-wrap:anywhere]">
                hello@rideflexrentals.com
              </p>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                Best for rental questions, pricing requests, and vehicle guidance.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[#e6e6e6] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#d61032]">
                Business hours
              </p>
              <p className="mt-3 text-lg font-semibold text-[#111111]">
                Mon - Sat, 8:00 AM to 7:00 PM
              </p>
              <p className="mt-2 text-sm leading-6 text-[#666666]">
                We reply during customer support hours across our active cities.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cars" className="button-secondary">
              Browse vehicles
            </Link>
            <Link href="/deals" className="button-primary">
              View current deals
            </Link>
          </div>
        </div>

        <ContactForm locations={locations} vehicleTypes={vehicleTypes} />
      </section>
    </div>
  );
}

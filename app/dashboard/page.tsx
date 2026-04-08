import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { LogoutButton } from "@/components/logout-button";
import { formatCurrency, formatDateRange } from "@/lib/format";
import { getFirstValue, type SearchParamRecord } from "@/lib/query";
import { requireUser } from "@/lib/session";
import {
  getBookingsForUser,
  getDashboardStats,
  splitBookingsByTime,
} from "@/lib/store";

type DashboardPageProps = {
  searchParams: Promise<SearchParamRecord>;
};

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your upcoming car rentals and booking history.",
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser("/login?redirect=/dashboard");
  const bookings = getBookingsForUser(user.id);
  const stats = getDashboardStats(user.id);
  const bookingId = getFirstValue((await searchParams).booking);
  const { upcoming: upcomingBookings, past: pastBookings } =
    splitBookingsByTime(bookings);

  return (
    <div className="page-shell py-8 md:py-12">
      <section className="glass-panel p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Your dashboard</p>
            <h1 className="section-heading mt-4">Welcome back, {user.name}</h1>
            <p className="section-copy mt-4 max-w-2xl">
              Review upcoming pickups, recent trips, and total spend from one
              simpler trip-management view.
            </p>
          </div>
          <LogoutButton />
        </div>

        {bookingId ? (
          <div className="mt-6 rounded-[1.2rem] border border-[#ffd3db] bg-[#fff3f6] px-5 py-4 text-sm text-[#b30828]">
            Booking confirmed. Your new trip has been added to the dashboard.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="stat-card">
            <p className="stat-value">{stats.totalTrips}</p>
            <p className="stat-label">Total bookings</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{stats.upcomingTrips}</p>
            <p className="stat-label">Upcoming trips</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{formatCurrency(stats.totalSpend)}</p>
            <p className="stat-label">Total spend</p>
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-8">
        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Your dashboard is ready. As soon as you confirm a reservation, it will appear here with trip timing, pricing, and vehicle details."
            actionHref="/cars"
            actionLabel="Browse cars"
          />
        ) : (
          <>
            <div>
              <p className="section-kicker">Upcoming</p>
              <h2 className="section-heading mt-3">Trips you can still prepare for</h2>
              <div className="mt-6 grid gap-5">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="glass-panel overflow-hidden p-5 md:p-7"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d61032]">
                            {booking.car.location}
                          </p>
                          <h3 className="mt-3 font-[var(--font-display)] text-3xl leading-none text-[#111111] md:text-4xl">
                            {booking.car.name}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-[#616161]">
                            {formatDateRange(booking.startDate, booking.endDate)}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] border border-[#ededed] bg-[#fafafa] px-5 py-4 text-[#111111] sm:text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
                            Booking total
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 md:grid-cols-4">
                        {[
                          `Type: ${booking.car.type}`,
                          `Seats: ${booking.car.seats}`,
                          `Fuel: ${booking.car.fuel}`,
                          `Transmission: ${booking.car.transmission}`,
                        ].map((item) => (
                          <div
                            key={item}
                            className="rounded-[1rem] border border-[#ececec] bg-[#fafafa] px-4 py-3 text-sm text-[#3f3f3f]"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="glass-panel p-6 text-sm leading-6 text-[#616161]">
                    No upcoming trips yet. When you confirm a new booking, it will
                    appear here first.
                  </div>
                )}
              </div>
            </div>

            {pastBookings.length > 0 ? (
              <div>
                <p className="section-kicker">History</p>
                <h2 className="section-heading mt-3">Past bookings</h2>
                <div className="mt-6 grid gap-4">
                  {pastBookings.map((booking) => (
                    <article key={booking.id} className="glass-panel p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="font-[var(--font-display)] text-3xl leading-none text-[#111111] md:text-4xl">
                            {booking.car.name}
                          </h3>
                          <p className="mt-2 text-sm text-[#616161]">
                            {formatDateRange(booking.startDate, booking.endDate)}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-[#111111]">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

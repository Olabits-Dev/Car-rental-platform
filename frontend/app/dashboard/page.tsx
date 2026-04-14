import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { InquiryStatusControl } from "@/components/inquiry-status-control";
import { LogoutButton } from "@/components/logout-button";
import { PaymentStatusBadge } from "@/components/payment-status";
import { CompleteCheckoutButton } from "@/components/complete-checkout-button";
import { getDashboardWithAuthService } from "@/lib/backend-auth";
import { formatCurrency, formatDateRange } from "@/lib/format";
import { getFirstValue, type SearchParamRecord } from "@/lib/query";
import {
  SESSION_COOKIE,
  getVerifiedSessionToken,
  requireUser,
} from "@/lib/session";
import { splitBookingsByTime } from "@/lib/store";
import type {
  AgentDashboardData,
  BookingWithCar,
  InquiryStatus,
  MemberDashboardData,
  OwnerDashboardData,
} from "@/lib/types";

type DashboardPageProps = {
  searchParams: Promise<SearchParamRecord>;
};

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage member trips, agent follow-up work, and owner operations.",
};

const inquiryStatusLabel: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

const inquiryStatusClassName: Record<InquiryStatus, string> = {
  new: "bg-[#fff1f4] text-[#d61032]",
  in_progress: "bg-[#fff7eb] text-[#b45309]",
  resolved: "bg-[#edfdf3] text-[#166534]",
};

function BookingSummaryCard({ booking }: { booking: BookingWithCar }) {
  const paymentStatus = booking.payment?.status;
  const needsCheckout =
    booking.status === "pending" && paymentStatus !== "success";

  const checkoutCopy =
    paymentStatus === "failed"
      ? {
          title: "Payment attempt failed",
          description:
            "Your booking is still on hold. Retry checkout to confirm this trip.",
        }
      : paymentStatus === "abandoned"
        ? {
            title: "Checkout was not completed",
            description:
              "Your booking is still reserved temporarily. Return to checkout to confirm it.",
          }
        : paymentStatus === "pending"
          ? {
              title: "Finish your checkout",
              description:
                "Your booking has been created, but payment is still pending. Complete checkout to confirm this trip.",
            }
          : {
              title: "Payment pending",
              description:
                "This booking is waiting for payment. Complete checkout from your dashboard to lock it in.",
            };

  return (
    <article className="glass-panel overflow-hidden p-5 md:p-6">
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
      {booking.payment && (
        <div className="mt-5">
          <PaymentStatusBadge status={booking.payment.status} />
        </div>
      )}
      {needsCheckout && (
        <div className="mt-5 space-y-3">
          <div className="rounded-[1.2rem] border border-[#fde68a] bg-[#fffbeb] p-4">
            <p className="text-sm font-semibold text-[#92400e]">
              {checkoutCopy.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#a16207]">
              {checkoutCopy.description}
            </p>
          </div>
          <CompleteCheckoutButton booking={booking} />
        </div>
      )}
    </article>
  );
}

function MemberDashboard({ dashboard }: { dashboard: MemberDashboardData }) {
  const { upcoming, past } = splitBookingsByTime(dashboard.bookings);

  return (
    <>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.totalTrips}</p>
          <p className="stat-label">Total bookings</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.upcomingTrips}</p>
          <p className="stat-label">Upcoming trips</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{formatCurrency(dashboard.stats.totalSpend)}</p>
          <p className="stat-label">Total spend</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.activeRequests}</p>
          <p className="stat-label">Open support requests</p>
        </div>
      </div>

      <section className="mt-8 space-y-8">
        {dashboard.bookings.length === 0 ? (
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
                {upcoming.length > 0 ? (
                  upcoming.map((booking) => (
                    <BookingSummaryCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="glass-panel p-6 text-sm leading-6 text-[#616161]">
                    No upcoming trips yet. When you confirm a new booking, it will
                    appear here first.
                  </div>
                )}
              </div>
            </div>

            {past.length > 0 ? (
              <div>
                <p className="section-kicker">History</p>
                <h2 className="section-heading mt-3">Past bookings</h2>
                <div className="mt-6 grid gap-4">
                  {past.map((booking) => (
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

        <div>
          <p className="section-kicker">Support</p>
          <h2 className="section-heading mt-3">Contact requests linked to your account</h2>
          <div className="mt-6 grid gap-4">
            {dashboard.inquiries.length > 0 ? (
              dashboard.inquiries.map((inquiry) => (
                <article key={inquiry.id} className="glass-panel p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {inquiry.location ?? "Any city"} / {inquiry.vehicleType ?? "Any type"}
                      </p>
                      <p className="mt-1 text-sm text-[#616161]">{inquiry.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${inquiryStatusClassName[inquiry.status]}`}
                    >
                      {inquiryStatusLabel[inquiry.status]}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#555555]">
                    {inquiry.message}
                  </p>
                </article>
              ))
            ) : (
              <div className="glass-panel p-6 text-sm leading-6 text-[#616161]">
                No support requests yet. Any future contact submission tied to your
                email will appear here.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function AgentDashboard({ dashboard }: { dashboard: AgentDashboardData }) {
  return (
    <section className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.openInquiries}</p>
          <p className="stat-label">New inquiries</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.inProgressInquiries}</p>
          <p className="stat-label">In progress</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.todayPickups}</p>
          <p className="stat-label">Today&apos;s pickups</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.upcomingBookings}</p>
          <p className="stat-label">Upcoming trips</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="glass-panel p-6 md:p-8">
          <p className="section-kicker">Inquiry queue</p>
          <h2 className="section-heading mt-3">Follow-ups waiting on operations</h2>
          <div className="mt-6 grid gap-4">
            {dashboard.inquiryQueue.map((inquiry) => (
              <article
                key={inquiry.id}
                className="rounded-[1.2rem] border border-[#e8e8e8] bg-[#fafafa] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">
                      {inquiry.name}
                    </p>
                    <p className="mt-1 text-sm text-[#666666]">{inquiry.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8b8b8b]">
                      {inquiry.location ?? "Any city"} / {inquiry.vehicleType ?? "Any type"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${inquiryStatusClassName[inquiry.status]}`}
                  >
                    {inquiryStatusLabel[inquiry.status]}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#555555]">
                  {inquiry.message}
                </p>
                <InquiryStatusControl inquiryId={inquiry.id} status={inquiry.status} />
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8">
            <p className="section-kicker">Upcoming work</p>
            <h2 className="section-heading mt-3">Trips to prepare for next</h2>
            <div className="mt-6 grid gap-4">
              {dashboard.assignedBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.2rem] border border-[#e8e8e8] bg-[#fafafa] px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {booking.car.name}
                      </p>
                      <p className="mt-1 text-sm text-[#666666]">
                        {booking.user?.name ?? "Customer"} / {booking.car.location}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#111111]">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#666666]">
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8">
            <p className="section-kicker">Recent members</p>
            <h2 className="section-heading mt-3">Newer customers in the system</h2>
            <div className="mt-6 grid gap-3">
              {dashboard.recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[1.2rem] border border-[#ececec] bg-[#fafafa] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-[#111111]">
                    {member.name}
                  </p>
                  <p className="mt-1 text-sm text-[#666666]">{member.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OwnerDashboard({ dashboard }: { dashboard: OwnerDashboardData }) {
  return (
    <section className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.totalMembers}</p>
          <p className="stat-label">Members</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.totalAgents}</p>
          <p className="stat-label">Agents</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.openInquiries}</p>
          <p className="stat-label">Open inquiries</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{dashboard.stats.upcomingBookings}</p>
          <p className="stat-label">Upcoming trips</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{formatCurrency(dashboard.stats.monthlyRevenue)}</p>
          <p className="stat-label">Month revenue</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6 md:p-8">
          <p className="section-kicker">Operations</p>
          <h2 className="section-heading mt-3">Recent bookings across the platform</h2>
          <div className="mt-6 grid gap-4">
            {dashboard.recentBookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[1.2rem] border border-[#ececec] bg-[#fafafa] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">
                      {booking.car.name}
                    </p>
                    <p className="mt-1 text-sm text-[#666666]">
                      {booking.user?.name ?? "Customer"} / {booking.car.location}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#666666]">
                  {formatDateRange(booking.startDate, booking.endDate)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8">
            <p className="section-kicker">Inquiry queue</p>
            <h2 className="section-heading mt-3">Support requests to supervise</h2>
            <div className="mt-6 grid gap-4">
              {dashboard.inquiryQueue.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="rounded-[1.2rem] border border-[#ececec] bg-[#fafafa] px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {inquiry.name}
                      </p>
                      <p className="mt-1 text-sm text-[#666666]">{inquiry.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${inquiryStatusClassName[inquiry.status]}`}
                    >
                      {inquiryStatusLabel[inquiry.status]}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#555555]">
                    {inquiry.message}
                  </p>
                  <InquiryStatusControl inquiryId={inquiry.id} status={inquiry.status} />
                </article>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8">
            <p className="section-kicker">Team</p>
            <h2 className="section-heading mt-3">Agents and newest members</h2>
            <div className="mt-6 grid gap-3">
              {dashboard.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[1.2rem] border border-[#ececec] bg-[#fafafa] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {member.name}
                      </p>
                      <p className="mt-1 text-sm text-[#666666]">{member.email}</p>
                    </div>
                    <span className="rounded-full bg-[#fff1f4] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#d61032]">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8">
        <p className="section-kicker">Location performance</p>
        <h2 className="section-heading mt-3">Where bookings are landing most often</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dashboard.locationPerformance.map((entry) => (
            <article
              key={entry.location}
              className="rounded-[1.2rem] border border-[#ececec] bg-[#fafafa] px-4 py-4"
            >
              <p className="text-sm font-semibold text-[#111111]">{entry.location}</p>
              <p className="mt-3 text-2xl font-semibold text-[#111111]">
                {entry.bookings}
              </p>
              <p className="mt-1 text-sm text-[#666666]">Bookings on record</p>
              <p className="mt-4 text-lg font-semibold text-[#111111]">
                {formatCurrency(entry.revenue)}
              </p>
              <p className="mt-1 text-sm text-[#666666]">Revenue touched</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser("/login?redirect=/dashboard");
  const sessionToken = getVerifiedSessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  const dashboard = await getDashboardWithAuthService(sessionToken);

  if (!dashboard) {
    redirect("/login?redirect=/dashboard");
  }

  const bookingId = getFirstValue((await searchParams).booking);

  return (
    <div className="page-shell py-8 md:py-12">
      <section className="glass-panel p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">
              {dashboard.role === "owner"
                ? "Owner overview"
                : dashboard.role === "agent"
                  ? "Agent operations"
                  : "Your dashboard"}
            </p>
            <h1 className="section-heading mt-4">Welcome back, {user.name}</h1>
            <p className="section-copy mt-4 max-w-3xl">
              {dashboard.role === "owner"
                ? "Track bookings, customer demand, support requests, and team activity from one operational view."
                : dashboard.role === "agent"
                  ? "Stay on top of inquiry follow-up, upcoming pickups, and the members who may need support next."
                  : "Review upcoming pickups, recent trips, and total spend from one simpler trip-management view."}
            </p>
          </div>
          <LogoutButton />
        </div>

        {bookingId ? (
          <div className="mt-6 rounded-[1.2rem] border border-[#ffd3db] bg-[#fff3f6] px-5 py-4 text-sm text-[#b30828]">
            Booking confirmed. Your new trip has been added to the dashboard.
          </div>
        ) : null}

        {dashboard.role === "member" ? (
          <MemberDashboard dashboard={dashboard} />
        ) : dashboard.role === "agent" ? (
          <AgentDashboard dashboard={dashboard} />
        ) : (
          <OwnerDashboard dashboard={dashboard} />
        )}
      </section>
    </div>
  );
}

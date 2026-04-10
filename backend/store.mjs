import { randomUUID } from "node:crypto";
import { getCarSummary } from "./car-catalog.mjs";
import { getSql, ensureSchema } from "./db.mjs";
import { getDealOfferByCode } from "./deals.mjs";
import {
  addDays,
  addHours,
  calculateBookingPrice,
  hashPassword,
  verifyPassword,
} from "./utils.mjs";

const VALID_INQUIRY_STATUSES = new Set(["new", "in_progress", "resolved"]);

export class BackendStoreError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "BackendStoreError";
    this.statusCode = statusCode;
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toIsoString(value) {
  return new Date(value).toISOString();
}

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: toIsoString(row.created_at),
  };
}

function toBookingRecord(row, user, assignedAgent) {
  const car = getCarSummary(row.car_id);

  if (!car) {
    throw new BackendStoreError(
      `Booking references an unknown car (${row.car_id}).`,
      500,
    );
  }

  return {
    id: row.id,
    userId: row.user_id,
    carId: row.car_id,
    startDate: toIsoString(row.start_date),
    endDate: toIsoString(row.end_date),
    totalPrice: Number(row.total_price),
    offerCode: row.offer_code ?? undefined,
    status: row.status,
    assignedAgentId: row.assigned_agent_id ?? null,
    createdAt: toIsoString(row.created_at),
    car,
    user: user ?? null,
    assignedAgent: assignedAgent ?? null,
  };
}

function toInquiryRecord(row, user, assignedAgent) {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    location: row.location ?? undefined,
    vehicleType: row.vehicle_type ?? undefined,
    message: row.message,
    status: row.status,
    assignedAgentId: row.assigned_agent_id ?? null,
    createdAt: toIsoString(row.created_at),
    user: user ?? null,
    assignedAgent: assignedAgent ?? null,
  };
}

async function getUsersByIds(sql, ids) {
  const uniqueIds = Array.from(
    new Set(ids.filter((value) => typeof value === "string" && value.length > 0)),
  );

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows = await sql`
    SELECT id, name, email, role, created_at
    FROM rideflex_users
    WHERE id IN ${sql(uniqueIds)}
  `;

  return new Map(rows.map((row) => [row.id, toPublicUser(row)]));
}

async function enrichBookings(sql, rows) {
  const userMap = await getUsersByIds(
    sql,
    rows.flatMap((row) => [row.user_id, row.assigned_agent_id]),
  );

  return rows.map((row) =>
    toBookingRecord(
      row,
      userMap.get(row.user_id) ?? null,
      row.assigned_agent_id ? (userMap.get(row.assigned_agent_id) ?? null) : null,
    ),
  );
}

async function enrichInquiries(sql, rows) {
  const userMap = await getUsersByIds(
    sql,
    rows.flatMap((row) => [row.user_id, row.assigned_agent_id]),
  );

  return rows.map((row) =>
    toInquiryRecord(
      row,
      row.user_id ? (userMap.get(row.user_id) ?? null) : null,
      row.assigned_agent_id ? (userMap.get(row.assigned_agent_id) ?? null) : null,
    ),
  );
}

function readOwnerSeed() {
  const email = process.env.OWNER_EMAIL?.trim();
  const password = process.env.OWNER_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "OWNER_EMAIL and OWNER_PASSWORD are required so the owner dashboard can be accessed.",
    );
  }

  return {
    id: "owner_primary",
    name: "RideFlex Owner",
    email,
    password,
    role: "owner",
  };
}

function readAgentSeed() {
  return {
    id: "agent_ops",
    name: "RideFlex Operations",
    email: process.env.AGENT_EMAIL?.trim() || "ops@rideflex.io",
    password: process.env.AGENT_PASSWORD?.trim() || "AgentDemo12345",
    role: "agent",
  };
}

async function upsertSeedUser(sql, seedUser) {
  const rows = await sql`
    INSERT INTO rideflex_users (id, name, email, role, password_hash, created_at)
    VALUES (
      ${seedUser.id},
      ${seedUser.name},
      ${normalizeEmail(seedUser.email)},
      ${seedUser.role},
      ${hashPassword(seedUser.password)},
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      password_hash = EXCLUDED.password_hash
    RETURNING id, name, email, role, created_at
  `;

  return toPublicUser(rows[0]);
}

async function seedBookings(sql, demoUser, guestUser, agentUser) {
  const bookingCountRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM rideflex_bookings
  `;

  if (Number(bookingCountRows[0].count) > 0) {
    return;
  }

  const now = new Date();

  const firstStart = addHours(addDays(now, 2), 10);
  firstStart.setMinutes(0, 0, 0);
  const firstEnd = addDays(firstStart, 3);

  const secondStart = addHours(addDays(now, 5), 9);
  secondStart.setMinutes(30, 0, 0);
  const secondEnd = addDays(secondStart, 2);

  const thirdStart = addHours(addDays(now, -8), 12);
  thirdStart.setMinutes(0, 0, 0);
  const thirdEnd = addDays(thirdStart, 2);

  const fourthStart = addHours(addDays(now, 1), 15);
  fourthStart.setMinutes(0, 0, 0);
  const fourthEnd = addDays(fourthStart, 1);

  const seedBookings = [
    {
      id: randomUUID(),
      userId: demoUser.id,
      carId: "toyota-fortuner-gx",
      startDate: firstStart.toISOString(),
      endDate: firstEnd.toISOString(),
      status: "confirmed",
      offerCode: null,
    },
    {
      id: randomUUID(),
      userId: guestUser.id,
      carId: "honda-accord-touring",
      startDate: secondStart.toISOString(),
      endDate: secondEnd.toISOString(),
      status: "confirmed",
      offerCode: "EXECSAVE8",
    },
    {
      id: randomUUID(),
      userId: demoUser.id,
      carId: "metro-q2",
      startDate: thirdStart.toISOString(),
      endDate: thirdEnd.toISOString(),
      status: "completed",
      offerCode: "CITYSAVE10",
    },
    {
      id: randomUUID(),
      userId: guestUser.id,
      carId: "cargo-v9",
      startDate: fourthStart.toISOString(),
      endDate: fourthEnd.toISOString(),
      status: "confirmed",
      offerCode: "GROUPMOVE15",
    },
  ];

  for (const booking of seedBookings) {
    const car = getCarSummary(booking.carId);
    const deal = booking.offerCode ? getDealOfferByCode(booking.offerCode) : null;
    const effectivePricePerDay = deal?.salePricePerDay ?? car?.pricePerDay;

    if (!car || !effectivePricePerDay) {
      continue;
    }

    await sql`
      INSERT INTO rideflex_bookings (
        id,
        user_id,
        car_id,
        start_date,
        end_date,
        total_price,
        offer_code,
        status,
        assigned_agent_id,
        created_at
      )
      VALUES (
        ${booking.id},
        ${booking.userId},
        ${booking.carId},
        ${booking.startDate},
        ${booking.endDate},
        ${calculateBookingPrice(
          effectivePricePerDay,
          booking.startDate,
          booking.endDate,
        )},
        ${booking.offerCode},
        ${booking.status},
        ${agentUser.id},
        NOW()
      )
    `;
  }
}

async function seedInquiries(sql, demoUser, agentUser) {
  const inquiryCountRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM rideflex_contact_inquiries
  `;

  if (Number(inquiryCountRows[0].count) > 0) {
    return;
  }

  const inquiries = [
    {
      id: randomUUID(),
      userId: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      phone: "+234 803 000 1122",
      location: "Lagos",
      vehicleType: "SUV",
      message:
        "I need a comfortable SUV for a weekend airport pickup and a family stay in Lagos.",
      status: "in_progress",
      assignedAgentId: agentUser.id,
    },
    {
      id: randomUUID(),
      userId: null,
      name: "Miriam Okafor",
      email: "miriam.okafor@example.com",
      phone: "+234 805 331 9020",
      location: "Abuja",
      vehicleType: "Sedan",
      message:
        "Can your team suggest a business sedan for a three-day client visit next week?",
      status: "new",
      assignedAgentId: null,
    },
  ];

  for (const inquiry of inquiries) {
    await sql`
      INSERT INTO rideflex_contact_inquiries (
        id,
        user_id,
        name,
        email,
        phone,
        location,
        vehicle_type,
        message,
        status,
        assigned_agent_id,
        created_at
      )
      VALUES (
        ${inquiry.id},
        ${inquiry.userId},
        ${inquiry.name},
        ${inquiry.email},
        ${inquiry.phone},
        ${inquiry.location},
        ${inquiry.vehicleType},
        ${inquiry.message},
        ${inquiry.status},
        ${inquiry.assignedAgentId},
        NOW()
      )
    `;
  }
}

async function bootstrapData() {
  await ensureSchema();

  const sql = getSql();
  const ownerUser = await upsertSeedUser(sql, readOwnerSeed());
  const agentUser = await upsertSeedUser(sql, readAgentSeed());
  const demoUser = await upsertSeedUser(sql, {
    id: "user_demo",
    name: "Alex Carter",
    email: "alex@rideflex.io",
    password: "demo12345",
    role: "member",
  });
  const guestUser = await upsertSeedUser(sql, {
    id: "user_guest",
    name: "Jordan Miles",
    email: "jordan@rideflex.io",
    password: "demo12345",
    role: "member",
  });

  await seedBookings(sql, demoUser, guestUser, agentUser);
  await seedInquiries(sql, demoUser, agentUser);

  return {
    ownerUser,
    agentUser,
    demoUser,
    guestUser,
  };
}

export async function ensureBackendReady() {
  if (!globalThis.__rideflexBootstrapPromise) {
    globalThis.__rideflexBootstrapPromise = bootstrapData().catch((error) => {
      globalThis.__rideflexBootstrapPromise = undefined;
      throw error;
    });
  }

  return globalThis.__rideflexBootstrapPromise;
}

async function requireAuthorizedUser(sessionToken, roles) {
  const user = await getUserFromSessionToken(sessionToken);

  if (!user) {
    throw new BackendStoreError("Unauthorized.", 401);
  }

  if (roles && !roles.includes(user.role)) {
    throw new BackendStoreError("You do not have access to that action.", 403);
  }

  return user;
}

async function getPrimaryAgentId(sql) {
  const rows = await sql`
    SELECT id
    FROM rideflex_users
    WHERE role = 'agent'
    ORDER BY created_at ASC
    LIMIT 1
  `;

  return rows[0]?.id ?? null;
}

export async function authenticateUser(input) {
  await ensureBackendReady();

  const email = normalizeEmail(input.email ?? "");
  const password = input.password?.trim() ?? "";

  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, role, password_hash, created_at
    FROM rideflex_users
    WHERE email = ${email}
    LIMIT 1
  `;

  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  return toPublicUser(user);
}

export async function registerUser(input) {
  await ensureBackendReady();

  const name = input.name?.trim() ?? "";
  const email = normalizeEmail(input.email ?? "");
  const password = input.password?.trim() ?? "";

  if (name.length < 2) {
    throw new BackendStoreError("Please enter a valid full name.", 400);
  }

  if (!email.includes("@")) {
    throw new BackendStoreError("Please enter a valid email address.", 400);
  }

  if (password.length < 8) {
    throw new BackendStoreError(
      "Password must be at least 8 characters long.",
      400,
    );
  }

  const sql = getSql();

  try {
    const rows = await sql`
      INSERT INTO rideflex_users (id, name, email, role, password_hash, created_at)
      VALUES (
        ${randomUUID()},
        ${name},
        ${email},
        ${"member"},
        ${hashPassword(password)},
        NOW()
      )
      RETURNING id, name, email, role, created_at
    `;

    return toPublicUser(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      throw new BackendStoreError(
        "An account with that email already exists.",
        409,
      );
    }

    throw error;
  }
}

export async function createSession(userId) {
  await ensureBackendReady();

  const session = {
    token: randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };

  const sql = getSql();
  await sql`
    INSERT INTO rideflex_sessions (token, user_id, created_at)
    VALUES (${session.token}, ${session.userId}, ${session.createdAt})
  `;

  return session;
}

export async function removeSession(sessionToken) {
  await ensureBackendReady();

  if (!sessionToken) {
    return;
  }

  const sql = getSql();
  await sql`
    DELETE FROM rideflex_sessions
    WHERE token = ${sessionToken}
  `;
}

export async function getUserFromSessionToken(sessionToken) {
  await ensureBackendReady();

  if (!sessionToken) {
    return null;
  }

  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role, u.created_at
    FROM rideflex_sessions s
    INNER JOIN rideflex_users u ON u.id = s.user_id
    WHERE s.token = ${sessionToken}
    LIMIT 1
  `;

  return rows[0] ? toPublicUser(rows[0]) : null;
}

export async function getBookingsForUser(userId) {
  await ensureBackendReady();

  const sql = getSql();
  const rows = await sql`
    SELECT *
    FROM rideflex_bookings
    WHERE user_id = ${userId}
    ORDER BY start_date ASC
  `;

  return enrichBookings(sql, rows);
}

export async function createBooking(input) {
  await ensureBackendReady();

  const car = getCarSummary(input.carId);

  if (!car) {
    throw new BackendStoreError("That car could not be found.", 404);
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new BackendStoreError(
      "Please choose a valid pickup and return time.",
      400,
    );
  }

  if (startDate >= endDate) {
    throw new BackendStoreError(
      "Return time must be later than your pickup time.",
      400,
    );
  }

  if (startDate.getTime() < Date.now() + 60 * 60 * 1000) {
    throw new BackendStoreError(
      "Bookings must start at least one hour from now.",
      400,
    );
  }

  const sql = getSql();
  const overlapRows = await sql`
    SELECT id
    FROM rideflex_bookings
    WHERE car_id = ${input.carId}
      AND status <> 'cancelled'
      AND ${input.startDate}::timestamptz < end_date
      AND start_date < ${input.endDate}::timestamptz
    LIMIT 1
  `;

  if (overlapRows.length > 0) {
    throw new BackendStoreError(
      "That car is already reserved for the selected time. Try another time slot.",
      409,
    );
  }

  const dealOffer = input.offerCode ? getDealOfferByCode(input.offerCode) : null;

  if (input.offerCode && (!dealOffer || dealOffer.car.id !== input.carId)) {
    throw new BackendStoreError(
      "That deal could not be applied to this booking. Please select the offer again.",
      400,
    );
  }

  const assignedAgentId = await getPrimaryAgentId(sql);
  const effectivePricePerDay = dealOffer?.salePricePerDay ?? car.pricePerDay;
  const bookingId = randomUUID();

  const rows = await sql`
    INSERT INTO rideflex_bookings (
      id,
      user_id,
      car_id,
      start_date,
      end_date,
      total_price,
      offer_code,
      status,
      assigned_agent_id,
      created_at
    )
    VALUES (
      ${bookingId},
      ${input.userId},
      ${input.carId},
      ${input.startDate},
      ${input.endDate},
      ${calculateBookingPrice(
        effectivePricePerDay,
        input.startDate,
        input.endDate,
      )},
      ${dealOffer?.code ?? null},
      ${"confirmed"},
      ${assignedAgentId},
      NOW()
    )
    RETURNING *
  `;

  const [booking] = await enrichBookings(sql, rows);
  return booking;
}

export async function createContactInquiry(input, currentUser = null) {
  await ensureBackendReady();

  const name = input.name?.trim() ?? "";
  const email = normalizeEmail(input.email ?? currentUser?.email ?? "");
  const phone = input.phone?.trim() || null;
  const location = input.location?.trim() || null;
  const vehicleType = input.vehicleType?.trim() || null;
  const message = input.message?.trim() ?? "";

  if (name.length < 2) {
    throw new BackendStoreError("Please enter your full name.", 400);
  }

  if (!email.includes("@")) {
    throw new BackendStoreError("Please enter a valid email address.", 400);
  }

  if (phone && phone.replace(/\D/g, "").length < 7) {
    throw new BackendStoreError("Please enter a valid phone number.", 400);
  }

  if (message.length < 20) {
    throw new BackendStoreError(
      "Please add a little more detail so our team can help you properly.",
      400,
    );
  }

  const sql = getSql();
  const assignedAgentId = await getPrimaryAgentId(sql);
  const rows = await sql`
    INSERT INTO rideflex_contact_inquiries (
      id,
      user_id,
      name,
      email,
      phone,
      location,
      vehicle_type,
      message,
      status,
      assigned_agent_id,
      created_at
    )
    VALUES (
      ${randomUUID()},
      ${currentUser?.id ?? null},
      ${name},
      ${email},
      ${phone},
      ${location},
      ${vehicleType},
      ${message},
      ${"new"},
      ${assignedAgentId},
      NOW()
    )
    RETURNING *
  `;

  const [inquiry] = await enrichInquiries(sql, rows);
  return inquiry;
}

async function getMemberDashboard(user) {
  const sql = getSql();
  const bookings = await getBookingsForUser(user.id);
  const inquiryRows = await sql`
    SELECT *
    FROM rideflex_contact_inquiries
    WHERE user_id = ${user.id} OR email = ${user.email}
    ORDER BY created_at DESC
    LIMIT 6
  `;
  const inquiries = await enrichInquiries(sql, inquiryRows);
  const now = Date.now();

  return {
    role: "member",
    user,
    stats: {
      totalTrips: bookings.length,
      upcomingTrips: bookings.filter(
        (booking) => new Date(booking.endDate).getTime() >= now,
      ).length,
      totalSpend: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      activeRequests: inquiries.filter((item) => item.status !== "resolved").length,
    },
    bookings,
    inquiries,
  };
}

async function getAgentDashboard(user) {
  const sql = getSql();
  const [
    inquiryRows,
    bookingRows,
    recentMemberRows,
    openInquiriesCountRows,
    inProgressCountRows,
    todayPickupRows,
    upcomingBookingRows,
  ] = await Promise.all([
    sql`
      SELECT *
      FROM rideflex_contact_inquiries
      WHERE status IN ('new', 'in_progress')
      ORDER BY
        CASE status
          WHEN 'new' THEN 0
          WHEN 'in_progress' THEN 1
          ELSE 2
        END,
        created_at DESC
      LIMIT 8
    `,
    sql`
      SELECT *
      FROM rideflex_bookings
      WHERE end_date >= NOW()
      ORDER BY start_date ASC
      LIMIT 8
    `,
    sql`
      SELECT id, name, email, role, created_at
      FROM rideflex_users
      WHERE role = 'member'
      ORDER BY created_at DESC
      LIMIT 6
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_contact_inquiries
      WHERE status = 'new'
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_contact_inquiries
      WHERE status = 'in_progress'
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_bookings
      WHERE start_date >= CURRENT_DATE
        AND start_date < CURRENT_DATE + INTERVAL '1 day'
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_bookings
      WHERE end_date >= NOW()
    `,
  ]);

  return {
    role: "agent",
    user,
    stats: {
      openInquiries: Number(openInquiriesCountRows[0].count),
      inProgressInquiries: Number(inProgressCountRows[0].count),
      todayPickups: Number(todayPickupRows[0].count),
      upcomingBookings: Number(upcomingBookingRows[0].count),
    },
    inquiryQueue: await enrichInquiries(sql, inquiryRows),
    assignedBookings: await enrichBookings(sql, bookingRows),
    recentMembers: recentMemberRows.map(toPublicUser),
  };
}

async function getOwnerDashboard(user) {
  const sql = getSql();
  const [
    recentBookingRows,
    inquiryRows,
    teamRows,
    memberCountRows,
    agentCountRows,
    openInquiryCountRows,
    monthlyRevenueRows,
    upcomingBookingRows,
    allBookingRows,
  ] = await Promise.all([
    sql`
      SELECT *
      FROM rideflex_bookings
      ORDER BY created_at DESC
      LIMIT 8
    `,
    sql`
      SELECT *
      FROM rideflex_contact_inquiries
      ORDER BY
        CASE status
          WHEN 'new' THEN 0
          WHEN 'in_progress' THEN 1
          ELSE 2
        END,
        created_at DESC
      LIMIT 8
    `,
    sql`
      SELECT id, name, email, role, created_at
      FROM rideflex_users
      WHERE role IN ('agent', 'member')
      ORDER BY
        CASE role
          WHEN 'agent' THEN 0
          ELSE 1
        END,
        created_at DESC
      LIMIT 8
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_users
      WHERE role = 'member'
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_users
      WHERE role = 'agent'
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_contact_inquiries
      WHERE status IN ('new', 'in_progress')
    `,
    sql`
      SELECT COALESCE(SUM(total_price), 0)::int AS total
      FROM rideflex_bookings
      WHERE start_date >= date_trunc('month', NOW())
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM rideflex_bookings
      WHERE end_date >= NOW()
    `,
    sql`
      SELECT car_id, total_price
      FROM rideflex_bookings
    `,
  ]);

  const locationMap = new Map();

  for (const row of allBookingRows) {
    const car = getCarSummary(row.car_id);

    if (!car) {
      continue;
    }

    const current = locationMap.get(car.location) ?? {
      location: car.location,
      bookings: 0,
      revenue: 0,
    };

    current.bookings += 1;
    current.revenue += Number(row.total_price);
    locationMap.set(car.location, current);
  }

  return {
    role: "owner",
    user,
    stats: {
      totalMembers: Number(memberCountRows[0].count),
      totalAgents: Number(agentCountRows[0].count),
      openInquiries: Number(openInquiryCountRows[0].count),
      monthlyRevenue: Number(monthlyRevenueRows[0].total),
      upcomingBookings: Number(upcomingBookingRows[0].count),
    },
    recentBookings: await enrichBookings(sql, recentBookingRows),
    inquiryQueue: await enrichInquiries(sql, inquiryRows),
    teamMembers: teamRows.map(toPublicUser),
    locationPerformance: [...locationMap.values()].sort(
      (left, right) => right.revenue - left.revenue,
    ),
  };
}

export async function getDashboardForSession(sessionToken) {
  const user = await requireAuthorizedUser(sessionToken);

  switch (user.role) {
    case "owner":
      return getOwnerDashboard(user);
    case "agent":
      return getAgentDashboard(user);
    default:
      return getMemberDashboard(user);
  }
}

export async function updateInquiryStatus(sessionToken, inquiryId, status) {
  await ensureBackendReady();

  const user = await requireAuthorizedUser(sessionToken, ["owner", "agent"]);

  if (!VALID_INQUIRY_STATUSES.has(status)) {
    throw new BackendStoreError("Please choose a valid inquiry status.", 400);
  }

  const sql = getSql();
  const currentRows = await sql`
    SELECT assigned_agent_id
    FROM rideflex_contact_inquiries
    WHERE id = ${inquiryId}
    LIMIT 1
  `;

  if (currentRows.length === 0) {
    throw new BackendStoreError("That inquiry could not be found.", 404);
  }

  const nextAssignedAgentId =
    user.role === "agent" ? user.id : (currentRows[0].assigned_agent_id ?? null);

  const rows = await sql`
    UPDATE rideflex_contact_inquiries
    SET
      status = ${status},
      assigned_agent_id = ${nextAssignedAgentId}
    WHERE id = ${inquiryId}
    RETURNING *
  `;

  const [inquiry] = await enrichInquiries(sql, rows);
  return inquiry;
}

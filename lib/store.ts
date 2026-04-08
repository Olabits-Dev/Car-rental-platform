import { createHash, randomUUID } from "crypto";
import { cars } from "@/lib/mock-data";
import { calculateBookingPrice } from "@/lib/format";
import type {
  Booking,
  BookingWithCar,
  Car,
  CarFilters,
  ContactInquiry,
  CreateBookingInput,
  CreateContactInquiryInput,
  DealOffer,
  PublicUser,
  SessionRecord,
  UserRecord,
} from "@/lib/types";

type Store = {
  users: UserRecord[];
  sessions: SessionRecord[];
  bookings: Booking[];
  contactInquiries: ContactInquiry[];
};

declare global {
  var __rideflexStore: Store | undefined;
}

export class StoreError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "StoreError";
  }
}

function hashPassword(password: string) {
  return createHash("sha256").update(`rideflex:${password}`).digest("hex");
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function buildSeedBooking(
  userId: string,
  carId: string,
  startDate: string,
  endDate: string,
): Booking {
  const car = cars.find((item) => item.id === carId);

  if (!car) {
    throw new Error(`Unknown seed car: ${carId}`);
  }

  return {
    id: randomUUID(),
    userId,
    carId,
    startDate,
    endDate,
    totalPrice: calculateBookingPrice(car.pricePerDay, startDate, endDate),
    createdAt: new Date().toISOString(),
  };
}

function createSeedStore(): Store {
  const now = new Date();

  const demoUser: UserRecord = {
    id: "user_demo",
    name: "Alex Carter",
    email: "alex@rideflex.io",
    passwordHash: hashPassword("demo12345"),
    createdAt: now.toISOString(),
  };

  const secondUser: UserRecord = {
    id: "user_guest",
    name: "Jordan Miles",
    email: "jordan@rideflex.io",
    passwordHash: hashPassword("demo12345"),
    createdAt: now.toISOString(),
  };

  const firstStart = new Date(now);
  firstStart.setDate(firstStart.getDate() + 2);
  firstStart.setHours(10, 0, 0, 0);

  const firstEnd = new Date(firstStart);
  firstEnd.setDate(firstEnd.getDate() + 3);

  const secondStart = new Date(now);
  secondStart.setDate(secondStart.getDate() + 6);
  secondStart.setHours(9, 30, 0, 0);

  const secondEnd = new Date(secondStart);
  secondEnd.setDate(secondEnd.getDate() + 2);

  const thirdStart = new Date(now);
  thirdStart.setDate(thirdStart.getDate() + 4);
  thirdStart.setHours(13, 0, 0, 0);

  const thirdEnd = new Date(thirdStart);
  thirdEnd.setDate(thirdEnd.getDate() + 1);

  return {
    users: [demoUser, secondUser],
    sessions: [],
    bookings: [
      buildSeedBooking(
        demoUser.id,
        "summit-x5",
        firstStart.toISOString(),
        firstEnd.toISOString(),
      ),
      buildSeedBooking(
        secondUser.id,
        "velar-r",
        secondStart.toISOString(),
        secondEnd.toISOString(),
      ),
      buildSeedBooking(
        secondUser.id,
        "aurora-s7",
        thirdStart.toISOString(),
        thirdEnd.toISOString(),
      ),
    ],
    contactInquiries: [],
  };
}

function getStore() {
  if (!globalThis.__rideflexStore) {
    globalThis.__rideflexStore = createSeedStore();
  }

  return globalThis.__rideflexStore;
}

function normalizeString(value?: string) {
  return value?.trim().toLowerCase();
}

const dealConfigs = [
  {
    carId: "metro-q2",
    code: "CITYSAVE10",
    title: "City saver rate",
    tag: "Urban deal",
    description: "Lower daily pricing for short city trips and weekday errands.",
    savingsPercent: 10,
    benefits: ["No promo entry needed on the deals page", "Works with normal booking flow"],
  },
  {
    carId: "atlas-gt",
    code: "COMMUTE12",
    title: "Sedan commuter special",
    tag: "Weekday value",
    description: "A stronger hybrid sedan rate for practical business travel.",
    savingsPercent: 12,
    benefits: ["Efficient daily pricing", "Best for 2-4 day bookings"],
  },
  {
    carId: "cargo-v9",
    code: "GROUPMOVE15",
    title: "Group transfer offer",
    tag: "Family & events",
    description: "Discounted people-mover pricing for airport transfers and event runs.",
    savingsPercent: 15,
    benefits: ["9-seat value option", "Good for airport and event pickups"],
  },
  {
    carId: "honda-accord-touring",
    code: "EXECSAVE8",
    title: "Executive sedan rate",
    tag: "Business favorite",
    description: "A cleaner daily rate for business-heavy schedules and repeat travel.",
    savingsPercent: 8,
    benefits: ["Premium comfort at a lower daily rate", "Applied before confirmation"],
  },
  {
    carId: "kia-sportage-lx",
    code: "HYBRIDDEAL11",
    title: "Hybrid crossover offer",
    tag: "Fuel-smart",
    description: "Reduced crossover pricing for customers who want practical hybrid mileage.",
    savingsPercent: 11,
    benefits: ["Lower daily spend", "Ideal for mixed city and family travel"],
  },
] as const;

function buildDealOffer(config: (typeof dealConfigs)[number]): DealOffer {
  const car = getCarById(config.carId);

  if (!car) {
    throw new Error(`Unknown deal car: ${config.carId}`);
  }

  const salePricePerDay = Math.max(
    1,
    Math.round(car.pricePerDay * (1 - config.savingsPercent / 100)),
  );

  return {
    code: config.code,
    title: config.title,
    tag: config.tag,
    description: config.description,
    savingsPercent: config.savingsPercent,
    savingsPerDay: car.pricePerDay - salePricePerDay,
    salePricePerDay,
    benefits: [...config.benefits],
    car,
  };
}

function intervalsOverlap(
  startDate: string,
  endDate: string,
  otherStartDate: string,
  otherEndDate: string,
) {
  return (
    new Date(startDate).getTime() < new Date(otherEndDate).getTime() &&
    new Date(otherStartDate).getTime() < new Date(endDate).getTime()
  );
}

export function listCars(filters: CarFilters = {}) {
  const query = normalizeString(filters.query);

  return cars
    .filter((car) => {
      if (filters.featuredOnly && !car.featured) {
        return false;
      }

      if (filters.location && car.location !== filters.location) {
        return false;
      }

      if (filters.type && car.type !== filters.type) {
        return false;
      }

      if (filters.maxPrice && car.pricePerDay > filters.maxPrice) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        car.name,
        car.brand,
        car.model,
        car.location,
        car.type,
        car.summary,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    })
    .sort((left, right) => {
      return (
        Number(right.featured) - Number(left.featured) ||
        left.pricePerDay - right.pricePerDay
      );
    });
}

export function getCarById(carId: string) {
  return cars.find((car) => car.id === carId);
}

export function getLocations() {
  return Array.from(new Set(cars.map((car) => car.location))).sort();
}

export function getCarTypes() {
  return Array.from(new Set(cars.map((car) => car.type))).sort();
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const store = getStore();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (name.length < 2) {
    throw new StoreError("Please enter a valid full name.", 400);
  }

  if (!email.includes("@")) {
    throw new StoreError("Please enter a valid email address.", 400);
  }

  if (password.length < 8) {
    throw new StoreError("Password must be at least 8 characters long.", 400);
  }

  const existingUser = store.users.find((user) => user.email === email);

  if (existingUser) {
    throw new StoreError("An account with that email already exists.", 409);
  }

  const user: UserRecord = {
    id: randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  store.users = [...store.users, user];

  return toPublicUser(user);
}

export function authenticateUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = hashPassword(input.password.trim());
  const user = getStore().users.find(
    (candidate) =>
      candidate.email === email && candidate.passwordHash === passwordHash,
  );

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}

export function createSession(userId: string) {
  const store = getStore();
  const session: SessionRecord = {
    token: randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };

  store.sessions = [...store.sessions, session];

  return session;
}

export function removeSession(sessionToken: string) {
  const store = getStore();
  store.sessions = store.sessions.filter((session) => session.token !== sessionToken);
}

export function getUserFromSessionToken(sessionToken?: string) {
  if (!sessionToken) {
    return null;
  }

  const store = getStore();
  const session = store.sessions.find((candidate) => candidate.token === sessionToken);

  if (!session) {
    return null;
  }

  const user = store.users.find((candidate) => candidate.id === session.userId);

  return user ? toPublicUser(user) : null;
}

export function getBookingsForCar(carId: string) {
  return [...getStore().bookings]
    .filter((booking) => booking.carId === carId)
    .sort(
      (left, right) =>
        new Date(left.startDate).getTime() - new Date(right.startDate).getTime(),
    );
}

export function getUpcomingBookingsForCar(carId: string) {
  const now = Date.now();

  return getBookingsForCar(carId).filter(
    (booking) => new Date(booking.endDate).getTime() > now,
  );
}

export function getBookingsForUser(userId: string): BookingWithCar[] {
  return [...getStore().bookings]
    .filter((booking) => booking.userId === userId)
    .sort(
      (left, right) =>
        new Date(left.startDate).getTime() - new Date(right.startDate).getTime(),
    )
    .map((booking) => {
      const car = getCarById(booking.carId);

      if (!car) {
        throw new Error(`Booking references missing car: ${booking.carId}`);
      }

      return {
        ...booking,
        car,
      };
    });
}

export function splitBookingsByTime(bookings: BookingWithCar[]) {
  const now = Date.now();

  return {
    upcoming: bookings.filter(
      (booking) => new Date(booking.endDate).getTime() >= now,
    ),
    past: bookings.filter((booking) => new Date(booking.endDate).getTime() < now),
  };
}

export function createBooking(input: CreateBookingInput): BookingWithCar {
  const store = getStore();
  const car = getCarById(input.carId);

  if (!car) {
    throw new StoreError("That car could not be found.", 404);
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new StoreError("Please choose a valid pickup and return time.", 400);
  }

  if (startDate >= endDate) {
    throw new StoreError(
      "Return time must be later than your pickup time.",
      400,
    );
  }

  const minimumLeadTime = Date.now() + 60 * 60 * 1000;

  if (startDate.getTime() < minimumLeadTime) {
    throw new StoreError(
      "Bookings must start at least one hour from now.",
      400,
    );
  }

  const conflictingBooking = store.bookings.find((booking) => {
    return (
      booking.carId === input.carId &&
      intervalsOverlap(
        input.startDate,
        input.endDate,
        booking.startDate,
        booking.endDate,
      )
    );
  });

  if (conflictingBooking) {
    throw new StoreError(
      "That car is already reserved for the selected time. Try another time slot.",
      409,
    );
  }

  const dealOffer = input.offerCode ? getDealOfferByCode(input.offerCode) : null;

  if (input.offerCode && (!dealOffer || dealOffer.car.id !== input.carId)) {
    throw new StoreError(
      "That deal could not be applied to this booking. Please select the offer again.",
      400,
    );
  }

  const effectiveDailyPrice = dealOffer?.salePricePerDay ?? car.pricePerDay;

  const booking: Booking = {
    id: randomUUID(),
    userId: input.userId,
    carId: input.carId,
    startDate: input.startDate,
    endDate: input.endDate,
    totalPrice: calculateBookingPrice(
      effectiveDailyPrice,
      input.startDate,
      input.endDate,
    ),
    offerCode: dealOffer?.code,
    createdAt: new Date().toISOString(),
  };

  store.bookings = [...store.bookings, booking];

  return {
    ...booking,
    car,
  };
}

export function createContactInquiry(
  input: CreateContactInquiryInput,
): ContactInquiry {
  const store = getStore();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim();
  const location = input.location?.trim();
  const vehicleType = input.vehicleType;
  const message = input.message.trim();

  if (name.length < 2) {
    throw new StoreError("Please enter your full name.", 400);
  }

  if (!email.includes("@")) {
    throw new StoreError("Please enter a valid email address.", 400);
  }

  if (phone && phone.replace(/\D/g, "").length < 7) {
    throw new StoreError("Please enter a valid phone number.", 400);
  }

  if (location && !getLocations().includes(location)) {
    throw new StoreError("Please select a valid pickup city.", 400);
  }

  if (vehicleType && !getCarTypes().includes(vehicleType)) {
    throw new StoreError("Please select a valid vehicle type.", 400);
  }

  if (message.length < 20) {
    throw new StoreError(
      "Please add a little more detail so our team can help you properly.",
      400,
    );
  }

  const inquiry: ContactInquiry = {
    id: randomUUID(),
    name,
    email,
    phone: phone || undefined,
    location: location || undefined,
    vehicleType,
    message,
    createdAt: new Date().toISOString(),
  };

  store.contactInquiries = [inquiry, ...store.contactInquiries];

  return inquiry;
}

export function getDashboardStats(userId: string) {
  const bookings = getBookingsForUser(userId);
  const now = Date.now();

  return {
    totalTrips: bookings.length,
    upcomingTrips: bookings.filter(
      (booking) => new Date(booking.startDate).getTime() > now,
    ).length,
    totalSpend: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
  };
}

export function getFeaturedCars(limit = 3) {
  return listCars({ featuredOnly: true }).slice(0, limit);
}

export function getDealOffers(limit = dealConfigs.length) {
  return dealConfigs.slice(0, limit).map(buildDealOffer);
}

export function getDealOfferByCode(code?: string) {
  const normalizedCode = normalizeString(code)?.toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const config = dealConfigs.find((item) => item.code === normalizedCode);

  return config ? buildDealOffer(config) : null;
}

export function getRelatedCars(car: Car, limit = 3) {
  return listCars({ type: car.type })
    .filter((candidate) => candidate.id !== car.id)
    .slice(0, limit);
}

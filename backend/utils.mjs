import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const normalizedPassword = password.trim();
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(
    normalizedPassword,
    `rideflex:${salt}`,
    KEY_LENGTH,
  ).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash?.includes(":")) {
    return false;
  }

  const [salt, existingHash] = storedHash.split(":");

  if (!salt || !existingHash) {
    return false;
  }

  const computedHash = scryptSync(
    password.trim(),
    `rideflex:${salt}`,
    KEY_LENGTH,
  );
  const existingBuffer = Buffer.from(existingHash, "hex");

  if (computedHash.length !== existingBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedHash, existingBuffer);
}

export function calculateBookingPrice(pricePerDay, startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const hours = Math.max(0, end - start) / (1000 * 60 * 60);
  const billableDays = Math.max(1, Math.ceil(hours / 24));

  return pricePerDay * billableDays;
}

export function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function addHours(date, hours) {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
}

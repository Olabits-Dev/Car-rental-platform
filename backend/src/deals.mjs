import { getCarSummary } from "./car-catalog.mjs";

const dealConfigs = [
  {
    carId: "metro-q2",
    code: "CITYSAVE10",
    title: "City saver rate",
    tag: "Urban deal",
    description: "Lower daily pricing for short city trips and weekday errands.",
    savingsPercent: 10,
  },
  {
    carId: "atlas-gt",
    code: "COMMUTE12",
    title: "Sedan commuter special",
    tag: "Weekday value",
    description: "A stronger hybrid sedan rate for practical business travel.",
    savingsPercent: 12,
  },
  {
    carId: "cargo-v9",
    code: "GROUPMOVE15",
    title: "Group transfer offer",
    tag: "Family & events",
    description: "Discounted people-mover pricing for airport transfers and event runs.",
    savingsPercent: 15,
  },
  {
    carId: "honda-accord-touring",
    code: "EXECSAVE8",
    title: "Executive sedan rate",
    tag: "Business favorite",
    description: "A cleaner daily rate for business-heavy schedules and repeat travel.",
    savingsPercent: 8,
  },
  {
    carId: "kia-sportage-lx",
    code: "HYBRIDDEAL11",
    title: "Hybrid crossover offer",
    tag: "Fuel-smart",
    description:
      "Reduced crossover pricing for customers who want practical hybrid mileage.",
    savingsPercent: 11,
  },
];

export function getDealOfferByCode(code) {
  const normalizedCode = code?.trim().toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const config = dealConfigs.find((item) => item.code === normalizedCode);

  if (!config) {
    return null;
  }

  const car = getCarSummary(config.carId);

  if (!car) {
    return null;
  }

  return {
    ...config,
    car,
    salePricePerDay: Math.max(
      1,
      Math.round(car.pricePerDay * (1 - config.savingsPercent / 100)),
    ),
  };
}

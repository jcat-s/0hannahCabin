import { isWeekend, addDays } from "date-fns";

export type CabinId = "ohannah" | "dream";
export type StayType = "day" | "evening" | "full";

export const CABIN_NAMES: Record<CabinId, string> = {
  ohannah: "OHANNAH CABIN",
  dream: "the DREAM BY OHANNAH",
};

// Weekday / Weekend rates (PHP) — from price sheet
// OHANNAH: Day 5500/6000, Evening 7500/8000, Full 10000/11000
// DREAM: Day 6000/7000, Evening 8000/9000, Full 12000/13000
const RATES: Record<CabinId, Record<StayType, { weekday: number; weekend: number }>> = {
  ohannah: {
    day: { weekday: 5_500, weekend: 6_000 },
    evening: { weekday: 7_500, weekend: 8_000 },
    full: { weekday: 10_000, weekend: 11_000 },
  },
  dream: {
    day: { weekday: 6_000, weekend: 7_000 },
    evening: { weekday: 8_000, weekend: 9_000 },
    full: { weekday: 12_000, weekend: 13_000 },
  },
};

// Philippine holidays 2026 (common — add more as needed)
const HOLIDAYS_2026: Date[] = [
  new Date(2026, 0, 1),   // New Year
  new Date(2026, 3, 9),   // Araw ng Kagitingan
  new Date(2026, 3, 2),   // Maundy Thursday
  new Date(2026, 3, 3),   // Good Friday
  new Date(2026, 4, 1),   // Labor Day
  new Date(2026, 5, 12),  // Independence Day
  new Date(2026, 7, 21),  // Ninoy Aquino Day
  new Date(2026, 7, 31), // National Heroes Day
  new Date(2026, 10, 30), // Bonifacio Day
  new Date(2026, 11, 25), // Christmas
  new Date(2026, 11, 30), // Rizal Day
];

function isHoliday(d: Date): boolean {
  return HOLIDAYS_2026.some(
    (h) => h.getFullYear() === d.getFullYear() && h.getMonth() === d.getMonth() && h.getDate() === d.getDate()
  );
}

/** Treat Friday–Sunday and holidays as “weekend” for pricing */
export function isWeekendOrHoliday(date: Date): boolean {
  return isWeekend(date) || isHoliday(date);
}

export function getRate(cabin: CabinId, stayType: StayType, date: Date): number {
  const rates = RATES[cabin][stayType];
  return isWeekendOrHoliday(date) ? rates.weekend : rates.weekday;
}

/** Total for a date range: sum of nightly rates (each night uses that day’s rate) */
export function getTotalForRange(
  cabin: CabinId,
  stayType: StayType,
  checkIn: Date,
  checkOut: Date
): number {
  let total = 0;
  let d = new Date(checkIn);
  const end = new Date(checkOut);
  while (d < end) {
    total += getRate(cabin, stayType, d);
    d = addDays(d, 1);
  }
  return total;
}

/** Inclusions text for the price sheet */
export const INCLUSIONS = {
  base: "Rate is good for 4 adults and 2 kids (below 3ft). No towels and toiletries included.",
  extraPaxDayEvening: "Additional 300 per pax (Day Lounge & Evening Chill)",
  extraPaxFull: "Additional 500 per pax (Full Stay)",
  pet: "Additional 250 per pet",
  maxPax: "Maximum capacity of cabin is 12 pax only",
} as const;

import { isWeekend, format, getDay } from "date-fns";

export type CabinId = "ohannah" | "dream";
export type StayType = "day" | "evening" | "full";

export const PRICING_DATA: Record<CabinId, Record<StayType, { weekday: number; weekend: number; extraPax: number }>> = {
  ohannah: {
    day: { weekday: 5500, weekend: 6000, extraPax: 300 },
    evening: { weekday: 7500, weekend: 8000, extraPax: 300 },
    full: { weekday: 10000, weekend: 11000, extraPax: 500 },
  },
  dream: {
    day: { weekday: 6000, weekend: 7000, extraPax: 300 },
    evening: { weekday: 8000, weekend: 9000, extraPax: 300 },
    full: { weekday: 12000, weekend: 13000, extraPax: 500 },
  },
};

const FIXED_PH_HOLIDAYS = ["01-01", "04-09", "05-01", "06-12", "08-31", "11-30", "12-25", "12-30", "02-17", "08-21", "11-01", "11-02", "12-08", "12-24", "12-31"];

/**
 * CUSTOM WEEKEND CHECK: Biyernes (5), Sabado (6), at Linggo (0)
 */
export function checkIsHighRate(date: Date, dbHolidays: string[] = []): boolean {
  const day = getDay(date);
  const isFriSatSun = day === 5 || day === 6 || day === 0; // Fri, Sat, Sun

  const monthDay = format(date, "MM-dd");
  const fullDate = format(date, "yyyy-MM-dd");

  return isFriSatSun || FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate);
}

/** * Logic: Base rate covers 4 Adults + 2 Kids (FREE). 
 * Extra pax charges only apply to Adults beyond the first 4.
 * Kids are strictly max 2 and always free based on UI.
 */
export function calculateTotal(
  cabin: CabinId,
  stayType: StayType,
  adults: number,
  pets: number,
  isHighRate: boolean,
  durationCount: number
) {
  const config = PRICING_DATA[cabin][stayType];
  const basePricePerUnit = isHighRate ? config.weekend : config.weekday;

  // Base price multiplied by duration (nights or slots)
  const totalBasePrice = basePricePerUnit * durationCount;

  // Extra Pax: 4 Adults included. 5th adult onwards has charge.
  const extraPaxCount = Math.max(0, adults - 4);
  const extraPaxTotal = extraPaxCount * config.extraPax;

  // Pets: 250 each
  const petTotal = pets * 250;

  return {
    basePrice: totalBasePrice,
    extraPaxCount,
    extraPaxRate: config.extraPax,
    extraPaxTotal,
    petTotal,
    grandTotal: totalBasePrice + extraPaxTotal + petTotal
  };
}
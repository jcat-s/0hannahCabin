import { format, getDay, eachDayOfInterval, subDays, parseISO } from "date-fns";

export type CabinId = "ohannah" | "dream";
export type StayType = "day" | "evening" | "full";

export type PricingEntry = { weekday: number; weekend: number; extraPax: number };
export type PricingData = Record<CabinId, Record<StayType, PricingEntry>>;

export const PRICING_DATA: PricingData = {
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
 * CUSTOM WEEKEND CHECK: Friday (5), Saturday (6), and Sunday (0)
 */
export function checkIsHighRate(date: Date, dbHolidays: string[] = []): boolean {
  const day = getDay(date);
  const isFriSatSun = day === 5 || day === 6 || day === 0;

  const monthDay = format(date, "MM-dd");
  const fullDate = format(date, "yyyy-MM-dd");

  return isFriSatSun || FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate);
}

/**
 * Logic: Calculates total by checking the rate for EACH night of the stay.
 */
export function calculateTotal(
  cabin: CabinId,
  stayType: StayType,
  adults: number,
  pets: number,
  checkIn: string,
  checkOut: string,
  dbHolidays: string[] = [],
  pricingOverride?: PricingData,
  petRate: number = 250
) {
  const pricingSource = pricingOverride || PRICING_DATA;
  const config = pricingSource[cabin][stayType];

  if (!checkIn || !checkOut) {
    return { basePrice: 0, extraPaxCount: 0, extraPaxRate: config.extraPax, extraPaxTotal: 0, petTotal: 0, grandTotal: 0 };
  }

  // Get all nights of the stay (from check-in until the day BEFORE check-out)
  const stayDates = eachDayOfInterval({
    start: parseISO(checkIn),
    end: stayType === 'full' ? subDays(parseISO(checkOut), 1) : parseISO(checkIn)
  });

  // Calculate base price by checking high rate for every single day in the range
  const totalBasePrice = stayDates.reduce((acc, date) => {
    const isHigh = checkIsHighRate(date, dbHolidays);
    return acc + (isHigh ? config.weekend : config.weekday);
  }, 0);

  // Extra Pax: 4 Adults included. Charge per night for Full Stay.
  const extraPaxCount = Math.max(0, adults - 4);
  const extraPaxTotal = extraPaxCount * config.extraPax * stayDates.length;

  // Pets: configured pet fee from policy, default 250 each
  const petTotal = pets * petRate;

  return {
    basePrice: totalBasePrice,
    extraPaxCount,
    extraPaxRate: config.extraPax,
    extraPaxTotal,
    petTotal,
    grandTotal: totalBasePrice + extraPaxTotal + petTotal
  };
}
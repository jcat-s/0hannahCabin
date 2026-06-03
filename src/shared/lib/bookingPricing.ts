import { format, getDay, eachDayOfInterval, subDays, parseISO, addDays } from "date-fns";

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
  const isFriSatSun = day === 5 || day === 6 || day === 0; // Kasama ang Friday base sa weekend structure niyo

  const monthDay = format(date, "MM-dd");
  const fullDate = format(date, "yyyy-MM-dd");

  return isFriSatSun || FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate);
}

/**
 * Logic: Calculates total by checking the rate for EACH night or shift pattern of the stay.
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

  const parsedCheckIn = parseISO(checkIn);

  // --- REVENUE PROTECTION LOGIC FOR STAYCATION SHIFTS ---
  let stayDates: Date[] = [];

  if (stayType === 'full') {
    // Para sa multi-day o full stay, bibilangin ang bawat gabi mula check-in hanggang bago mag-checkout
    stayDates = eachDayOfInterval({
      start: parsedCheckIn,
      end: subDays(parseISO(checkOut), 1)
    });
  } else if (stayType === 'evening') {
    // Para sa Evening Chill: Dahil ang stay ay overnight (lalampas ng 12AM), kung ang checkout day 
    // ay pumatak sa weekend o holiday, ikokonsidera nating High Rate ang buong slot para iwas lugi.
    const parsedCheckOut = parseISO(checkOut);
    const isCheckOutHigh = checkIsHighRate(parsedCheckOut, dbHolidays);
    const isCheckInHigh = checkIsHighRate(parsedCheckIn, dbHolidays);

    // Kung alinman sa check-in o check-out date ang high rate, high rate ang gabi na 'yan.
    stayDates = [isCheckOutHigh || isCheckInHigh ? parsedCheckOut : parsedCheckIn];
  } else {
    // Standard Day tour (Pasok at alis sa iisang araw lang)
    stayDates = [parsedCheckIn];
  }

  // Calculate base price sa bawat araw na nakuha sa taas
  const totalBasePrice = stayDates.reduce((acc, date) => {
    const isHigh = checkIsHighRate(date, dbHolidays);
    return acc + (isHigh ? config.weekend : config.weekday);
  }, 0);

  // Extra Pax: 4 Adults included base sa maximum capacity setup niyo. Charge per block/night.
  const extraPaxCount = Math.max(0, adults - 4);

  // Para sa Day/Evening, stayDates.length ay laging 1, para sa Full stay ay depende sa dami ng gabi.
  const extraPaxTotal = extraPaxCount * config.extraPax * (stayType === 'full' ? stayDates.length : 1);

  // Pets: flat rate multiplier kung ilang alagang hayop ang kasama
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
import React, { useState, useEffect } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, subMonths, addMonths, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";

const FIXED_PH_HOLIDAYS = ["01-01", "04-09", "05-01", "06-12", "08-31", "11-30", "12-25", "12-30", "02-17", "08-21", "11-01", "11-02", "12-08", "12-24", "12-31"];

// Helper to check if a date is a holiday or a custom weekend (Fri-Sun)
export const checkIsHoliday = (date: Date, dbHolidays: string[]) => {
    const monthDay = format(date, "MM-dd");
    const fullDate = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date); // 0 = Sunday, 5 = Friday, 6 = Saturday

    const isCustomWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const isHoliday = FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate);

    return isHoliday || isCustomWeekend;
};

// Static color mapping para sa Calendar (Dapat match sa BookingCategory)
const CALENDAR_COLORS: Record<string, string> = {
    pink: "bg-pink-400",
    red: "bg-red-400",
    orange: "bg-orange-400",
    yellow: "bg-yellow-400",
    green: "bg-green-400",
    blue: "bg-blue-400",
    indigo: "bg-indigo-400",
    violet: "bg-violet-400",
};

interface CalendarBookedProps {
    currentViewDate: Date;
    setCurrentViewDate: (d: Date) => void;
    filteredBookings: any[];
}

export function CalendarBooked({ currentViewDate, setCurrentViewDate, filteredBookings }: CalendarBookedProps) {
    const [dbHolidays, setDbHolidays] = useState<string[]>([]);

    useEffect(() => {
        if (!db) return;
        return onSnapshot(doc(db, "metadata", "holidays"), (docSnap) => {
            if (docSnap.exists()) setDbHolidays(docSnap.data().dates || []);
        });
    }, []);

    const days = eachDayOfInterval({
        start: startOfMonth(currentViewDate),
        end: endOfMonth(currentViewDate)
    });

    // Start of month offset (Para sa Monday-start calendar)
    const firstDow = (startOfMonth(currentViewDate).getDay() + 6) % 7;

    return (
        <section className="bg-white rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden">
            <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))}
                        className="p-3 hover:bg-white rounded-full border border-zinc-200 transition-all active:scale-90"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <h2 className="text-xl font-serif italic text-zinc-900">{format(currentViewDate, "MMMM yyyy")}</h2>
                    <button
                        onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))}
                        className="p-3 hover:bg-white rounded-full border border-zinc-200 transition-all active:scale-90"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Holiday/Weekend Rate (Fri-Sun)</span>
                </div>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-7 gap-4">
                    {/* Day Headers */}
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-zinc-300 uppercase pb-8">{d}</div>
                    ))}

                    {/* Empty Slots for Padding */}
                    {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}

                    {/* Actual Calendar Days */}
                    {days.map(d => {
                        const dateStr = format(d, "yyyy-MM-dd");
                        const isHighRate = checkIsHoliday(d, dbHolidays);

                        // Hanapin kung may booking sa araw na ito
                        const booking = filteredBookings.find(b => {
                            const start = parseISO(b.checkIn);
                            const end = b.stayType === "day"
                                ? addDays(parseISO(b.checkOut), 1)
                                : parseISO(b.checkOut);
                            return d >= start && d < end;
                        });

                        const bgColorClass = booking ? (CALENDAR_COLORS[booking.color] || "bg-zinc-400") : "";

                        // Get stay time label
                        const getStayTimeLabel = (booking: any) => {
                            if (!booking) return "";
                            if (booking.stayType === "day") {
                                return booking.fullStayOption || "Day";
                            } else {
                                return booking.fullStayOption || "Night";
                            }
                        };

                        return (
                            <div
                                key={d.toString()}
                                className={`h-14 border border-zinc-50 flex flex-col items-center justify-center rounded-[1.2rem] relative transition-all
                                    ${booking
                                        ? `${bgColorClass} text-white z-10 scale-[1.05] shadow-lg`
                                        : "hover:bg-zinc-50 text-zinc-400"
                                    }`}
                            >
                                <span className="text-sm font-bold">{format(d, "d")}</span>

                                {booking ? (
                                    <span className="text-[6px] uppercase font-black mt-1">
                                        {getStayTimeLabel(booking)}
                                    </span>
                                ) : (
                                    isHighRate && (
                                        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-[#D4AF37]" />
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
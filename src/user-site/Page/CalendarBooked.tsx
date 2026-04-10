import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWeekend, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";

// 1. FIXED HOLIDAYS (MM-DD) 
const FIXED_PH_HOLIDAYS = [
    "01-01", "New Year's Day",
    "04-09", "Araw ng Kagitingan",
    "05-01", "Labor Day",
    "06-12", "Independence Day",
    "08-31", "National Heroes Day",
    "11-30", "Bonifacio Day",
    "12-25", "Christmas Day",
    "12-30", "Rizal Day",

    "02-17", "Chinese New Year",
    "08-21", "Ninoy Aquino Day",
    "11-01", "All Saints' Day",
    "11-02", "All Souls' Day",
    "12-08", "Immaculate Conception",
    "12-24", "Christmas Eve",
    "12-31", "New Year's Eve",
];

// Helper function na i-export para magamit din sa BookingPage price calculation
export const checkIsHoliday = (date: Date, dbHolidays: string[]) => {
    const monthDay = format(date, "MM-dd");
    const fullDate = format(date, "yyyy-MM-dd");
    return FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate);
};

interface CalendarBookedProps {
    currentViewDate: Date;
    setCurrentViewDate: (d: Date) => void;
    filteredBookings: any[];
    bookingColors: { id: string, bg: string }[];
}

export function CalendarBooked({ currentViewDate, setCurrentViewDate, filteredBookings, bookingColors }: CalendarBookedProps) {
    const [dbHolidays, setDbHolidays] = useState<string[]>([]);

    // 2.   Firebase para sa Movable Holidays (Holy Week, etc.)

    useEffect(() => {
        if (!db) return;
        const unsub = onSnapshot(doc(db, "metadata", "holidays"), (docSnap) => {
            if (docSnap.exists()) {
                setDbHolidays(docSnap.data().dates || []);
            }
        });
        return () => unsub();
    }, []);

    const start = startOfMonth(currentViewDate);
    const end = endOfMonth(currentViewDate);
    const days = eachDayOfInterval({ start, end });
    const firstDow = (start.getDay() + 6) % 7;

    return (
        <section className="bg-white rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden">
            {/* Header with Legend */}
            <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-center bg-zinc-50/30 gap-4">
                <div className="flex items-center gap-8">
                    <button onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))} className="p-3 hover:bg-white rounded-full border border-zinc-200 shadow-sm transition-all active:scale-95">
                        <ChevronLeft size={16} />
                    </button>
                    <h2 className="text-xl font-serif italic text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {format(currentViewDate, "MMMM yyyy")}
                    </h2>
                    <button onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))} className="p-3 hover:bg-white rounded-full border border-zinc-200 shadow-sm transition-all active:scale-95">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Legend: Weekend vs Holiday */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 border-r border-zinc-200 pr-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                Weekend / <span className="text-[#D4AF37]">Holiday Rate</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded text-[7px] font-black text-zinc-500 uppercase">
                            PH = Public Holiday
                        </div>
                    </div>

                </div>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-7 gap-4">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest pb-8">{d}</div>
                    ))}

                    {Array.from({ length: firstDow }).map((_, i) => <div key={`pad-${i}`} />)}

                    {days.map(d => {
                        const isHoliday = checkIsHoliday(d, dbHolidays);
                        const isHighRate = isWeekend(d) || isHoliday;

                        const booking = filteredBookings.find(b => {
                            const bStart = parseISO(b.checkIn);
                            const bEnd = parseISO(b.checkOut);
                            return (isSameDay(d, bStart) || isSameDay(d, bEnd) || (d >= bStart && d <= bEnd));
                        });
                        const color = booking ? bookingColors.find(c => c.id === booking.color) : null;

                        return (
                            <div key={d.toString()} className={`h-12 border border-zinc-50 flex flex-col items-center justify-center rounded-[1.5rem] relative transition-all duration-700 ${color ? `${color.bg} text-white shadow-xl z-10 scale-[1.03] ring-4 ring-white` : "hover:bg-zinc-50 text-zinc-400"}`}>
                                <span className="text-sm font-bold">{format(d, "d")}</span>

                                {color ? (
                                    <span className="text-[7px] uppercase font-black tracking-widest opacity-80 mt-1">Booked</span>
                                ) : (
                                    isHighRate && (
                                        <div className="absolute top-3 right-3 flex flex-col items-center gap-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                            {isHoliday && <span className="text-[5px] text-[#D4AF37] font-black leading-none">PH</span>}
                                        </div>
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
import React, { useState, useEffect } from "react";
import {
    format,
    addDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    parseISO,
    subMonths,
    addMonths,
    getDay,
    isWithinInterval,
    startOfDay,
    isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { StayType } from "../../shared/lib/bookingPricing";

const FIXED_PH_HOLIDAYS = ["01-01", "04-09", "05-01", "06-12", "08-31", "11-30", "12-25", "12-30", "02-17", "08-21", "11-01", "11-02", "12-08", "12-24", "12-31"];

export const checkIsHoliday = (date: Date, dbHolidays: string[]) => {
    const monthDay = format(date, "MM-dd");
    const fullDate = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date);
    const isCustomWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const isHoliday = FIXED_PH_HOLIDAYS.includes(monthDay) || dbHolidays.includes(fullDate);
    return isHoliday || isCustomWeekend;
};

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
    checkIn: string;
    setCheckIn: (v: string) => void;
    checkOut: string;
    setCheckOut: (v: string) => void;
    stayType: StayType;
}

export function CalendarBooked({ currentViewDate, setCurrentViewDate, filteredBookings, checkIn, setCheckIn, checkOut, setCheckOut, stayType }: CalendarBookedProps) {
    const [dbHolidays, setDbHolidays] = useState<string[]>([]);
    const [activeField, setActiveField] = useState<"checkIn" | "checkOut">("checkIn");

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

    const confirmedBookings = filteredBookings.filter(b => String(b.status).toLowerCase() === "confirmed");

    const firstDow = (startOfMonth(currentViewDate).getDay() + 6) % 7;
    const selectedCheckIn = checkIn ? parseISO(checkIn) : null;
    const selectedCheckOut = checkOut ? parseISO(checkOut) : null;

    const handleDayClick = (date: Date) => {
        const iso = format(date, "yyyy-MM-dd");

        if (activeField === "checkIn") {
            setCheckIn(iso);
            if (stayType !== "full") {
                setCheckOut(iso);
            } else {
                const nextDay = format(addDays(date, 1), "yyyy-MM-dd");
                setCheckOut(nextDay);
            }
            return;
        }

        if (activeField === "checkOut") {
            if (stayType !== "full") {
                setCheckIn(iso);
                setCheckOut(iso);
                return;
            }

            const parsedCheckIn = parseISO(checkIn);
            if (date <= parsedCheckIn) {
                setCheckIn(iso);
                setCheckOut(format(addDays(date, 1), "yyyy-MM-dd"));
            } else {
                setCheckOut(iso);
            }
        }
    };

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
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Holiday/Weekend Rate</span>
                </div>
            </div>

            <div className="p-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Step 3: Pick Dates</h3>
                        <p className="text-[10px] text-zinc-500 mt-2">Tap "Select Check-in" or "Select Check-out" then choose the day on the calendar.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => setActiveField("checkIn")}
                            className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition ${activeField === "checkIn" ? 'bg-[#D4AF37] text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'}`}
                        >
                            Select Check-in
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveField("checkOut")}
                            disabled={stayType !== "full"}
                            className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition ${activeField === "checkOut" ? 'bg-[#D4AF37] text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'} ${stayType !== "full" ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            Select Check-out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-zinc-300 uppercase pb-8">{d}</div>
                    ))}

                    {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}

                    {days.map(d => {
                        const currentIterationDay = startOfDay(d);
                        const isHighRate = checkIsHoliday(d, dbHolidays);

                        // logic para mahanap ang booking sa range
                        const booking = confirmedBookings.find(b => {
                            const start = startOfDay(parseISO(b.checkInDate || b.checkIn));
                            const end = startOfDay(parseISO(b.checkOutDate || b.checkOut));

                            // Kung May 5 to 13, dapat kasama ang 5 at 13 sa interval
                            return isWithinInterval(currentIterationDay, { start, end });
                        });

                        const bgColorClass = booking ? (CALENDAR_COLORS[booking.color] || "bg-zinc-400") : "";
                        const isSelectedCheckIn = selectedCheckIn ? isSameDay(currentIterationDay, selectedCheckIn) : false;
                        const isSelectedCheckOut = selectedCheckOut ? isSameDay(currentIterationDay, selectedCheckOut) : false;
                        const isInSelectedRange = selectedCheckIn && selectedCheckOut && stayType === "full" && isWithinInterval(currentIterationDay, { start: selectedCheckIn, end: selectedCheckOut });
                        const isSelectable = !booking && currentIterationDay >= startOfDay(new Date());
                        const statusClasses = booking
                            ? `${bgColorClass} text-white z-10 scale-[1.05] shadow-lg cursor-not-allowed`
                            : isSelectedCheckIn || isSelectedCheckOut
                                ? "bg-[#D4AF37] text-white shadow-lg"
                                : isInSelectedRange
                                    ? "bg-[#D4AF37]/10 text-zinc-900"
                                    : "hover:bg-zinc-50 text-zinc-400 cursor-pointer";

                        return (
                            <button
                                key={d.toString()}
                                type="button"
                                onClick={() => isSelectable && handleDayClick(currentIterationDay)}
                                disabled={!isSelectable}
                                className={`h-14 border border-zinc-50 flex flex-col items-center justify-center rounded-[1.2rem] relative transition-all text-sm font-bold ${statusClasses}`}
                            >
                                <span>{format(d, "d")}</span>

                                {booking ? (
                                    <span className="text-[6px] uppercase font-black mt-1">
                                        {booking.stayType === "day" ? "Day" : (booking.fullStayOption || "Stay")}
                                    </span>
                                ) : (
                                    isHighRate && (
                                        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-[#D4AF37]" />
                                    )
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
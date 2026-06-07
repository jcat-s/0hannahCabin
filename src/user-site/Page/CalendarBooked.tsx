import React, { useState, useEffect } from "react";
import {
    format,
    addDays,
    subDays,
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
    pink: "bg-pink-200 text-pink-900",
    red: "bg-red-200 text-red-900",
    orange: "bg-orange-200 text-orange-900",
    yellow: "bg-yellow-200 text-yellow-900",
    green: "bg-green-200 text-green-900",
    blue: "bg-blue-200 text-blue-900",
    indigo: "bg-indigo-200 text-indigo-900",
    violet: "bg-violet-200 text-violet-900",
};

const getSlotMarkers = (b: any) => {
    const type = String(b.stayType || '').toLowerCase();
    const slotStr = String(b.fullStayOption || b.timeSlot || b.stayCategory || '').toUpperCase();

    let inTime = "3PM";
    let outTime = "12NN";

    if (type === 'day' || slotStr.includes('9AM-5PM') || slotStr.includes('9AM TO 5PM')) {
        return { inTime: "9AM", outTime: "5PM" };
    }

    if (type === 'evening' || slotStr.includes('8PM-7AM') || slotStr.includes('8PM TO 7AM')) {
        return { inTime: "8PM", outTime: "7AM" };
    }

    if (slotStr.includes('9AM-7AM') || slotStr.includes('9AM TO 7AM')) {
        return { inTime: "9AM", outTime: "7AM" };
    }

    if (slotStr.includes('8PM-5PM') || slotStr.includes('8PM TO 5PM')) {
        return { inTime: "8PM", outTime: "5PM" };
    }

    if (slotStr.includes('3PM-12NN') || slotStr.includes('3PM TO 12NN')) {
        return { inTime: "3PM", outTime: "12NN" };
    }

    return { inTime, outTime };
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
    fullStayOption?: "9AM-7AM" | "8PM-5PM" | "3PM-12NN";
}

export function CalendarBooked({
    currentViewDate,
    setCurrentViewDate,
    filteredBookings,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    stayType,
    fullStayOption = "3PM-12NN"
}: CalendarBookedProps) {
    const [dbHolidays, setDbHolidays] = useState<string[]>([]);
    const [activeField, setActiveField] = useState<"checkIn" | "checkOut">("checkIn");

    useEffect(() => {
        if (!db) return;
        return onSnapshot(doc(db, "metadata", "holidays"), (docSnap) => {
            if (docSnap.exists()) setDbHolidays(docSnap.data().dates || []);
        });
    }, []);

    useEffect(() => {
        if (stayType !== "full") {
            setActiveField("checkIn");
        }
    }, [stayType]);

    const days = eachDayOfInterval({
        start: startOfMonth(currentViewDate),
        end: endOfMonth(currentViewDate)
    });

    const confirmedBookings = filteredBookings.filter(b => String(b.status).toLowerCase() === "confirmed");
    const firstDow = (startOfMonth(currentViewDate).getDay() + 6) % 7;
    const selectedCheckIn = checkIn ? parseISO(checkIn) : null;
    const selectedCheckOut = checkOut ? parseISO(checkOut) : null;

    const checkHasMiddleOverlap = (startDate: Date, endDate: Date) => {
        let hasMiddleOverlap = false;
        const targetInterval = { start: startDate, end: endDate };

        for (const b of confirmedBookings) {
            const bStart = startOfDay(parseISO(b.checkInDate || b.checkIn));
            const bEnd = startOfDay(parseISO(b.checkOutDate || b.checkOut));
            const { inTime, outTime } = getSlotMarkers(b);

            const daysInBooking = eachDayOfInterval({ start: bStart, end: bEnd });

            for (const day of daysInBooking) {
                if (isWithinInterval(day, targetInterval)) {
                    const isFirstDayOfRange = isSameDay(day, targetInterval.start);
                    const isLastDayOfRange = isSameDay(day, targetInterval.end);

                    if (isSameDay(day, bStart) && isSameDay(day, bEnd)) {
                        if (String(b.stayType).toLowerCase() === 'evening') {
                            if (!isFirstDayOfRange) hasMiddleOverlap = true;
                        } else {
                            if (!isLastDayOfRange) hasMiddleOverlap = true;
                        }
                    } else if (isSameDay(day, bStart)) {
                        if (inTime === "9AM" && !isLastDayOfRange) hasMiddleOverlap = true;
                        if (inTime === "3PM" && !isLastDayOfRange) hasMiddleOverlap = true;
                        if (inTime === "8PM" && !isLastDayOfRange) hasMiddleOverlap = true;
                    } else if (isSameDay(day, bEnd)) {
                        if (outTime === "5PM" && !isFirstDayOfRange) hasMiddleOverlap = true;
                        if (outTime === "12NN" && !isFirstDayOfRange) hasMiddleOverlap = true;
                    } else {
                        hasMiddleOverlap = true;
                    }
                }
            }
            if (hasMiddleOverlap) break;
        }
        return hasMiddleOverlap;
    };

    const handleDayClick = (date: Date) => {
        const iso = format(date, "yyyy-MM-dd");

        if (activeField === "checkIn") {
            setCheckIn(iso);
            if (stayType === "day" || stayType === "evening") {
                setCheckOut(iso);
            } else if (stayType === "full") {
                setCheckOut("");
                setActiveField("checkOut");
            }
            return;
        }

        if (activeField === "checkOut") {
            if (stayType !== "full") return;

            const parsedCheckIn = parseISO(checkIn);
            if (date <= parsedCheckIn) {
                setCheckIn(iso);
                setCheckOut("");
                return;
            }

            setCheckOut(iso);
        }
    };

    const getDayStateMap = (targetDate: Date) => {
        const currentIterationDay = startOfDay(targetDate);
        const dayState = {
            top: { occupied: false, color: '', label: '', exactOutTime: '' },
            bottom: { occupied: false, color: '', label: '', exactInTime: '' }
        };

        confirmedBookings.forEach(b => {
            const checkInDay = startOfDay(parseISO(b.checkInDate || b.checkIn));
            const checkOutDay = startOfDay(parseISO(b.checkOutDate || b.checkOut));
            const { inTime, outTime } = getSlotMarkers(b);
            const colorClass = CALENDAR_COLORS[b.color] || "bg-zinc-400 text-white";
            const bType = String(b.stayType).toLowerCase();

            const isMidDay = currentIterationDay > checkInDay && currentIterationDay < checkOutDay;
            const isCheckInDay = isSameDay(currentIterationDay, checkInDay);
            const isCheckOutDay = isSameDay(currentIterationDay, checkOutDay);
            const isDayBeforeCheckOut = isSameDay(currentIterationDay, subDays(checkOutDay, 1));

            if (isMidDay) {
                dayState.top = { occupied: true, color: colorClass, label: '', exactOutTime: outTime };
                dayState.bottom = { occupied: true, color: colorClass, label: '', exactInTime: inTime };

                if (isDayBeforeCheckOut && outTime === "7AM" && bType === 'full') {
                    dayState.bottom.label = 'OUT 7AM NEXT DAY';
                }
            } else if (isCheckInDay && isCheckOutDay) {
                if (bType === 'evening') {
                    dayState.bottom = { occupied: true, color: colorClass, label: 'EVE', exactInTime: '8PM' };
                } else {
                    dayState.top = { occupied: true, color: colorClass, label: 'DAY', exactOutTime: '5PM' };
                }
            } else if (isCheckInDay) {
                if (bType === 'evening') {
                    dayState.bottom = { occupied: true, color: colorClass, label: 'EVE', exactInTime: '8PM' };
                } else {
                    if (inTime === "9AM") {
                        dayState.top = { occupied: true, color: colorClass, label: 'IN 9AM', exactOutTime: '' };
                        dayState.bottom = { occupied: true, color: colorClass, label: '', exactInTime: '9AM' };
                    } else if (inTime === "3PM") {
                        dayState.bottom = { occupied: true, color: colorClass, label: 'IN 3PM', exactInTime: '3PM' };
                    } else if (inTime === "8PM") {
                        dayState.bottom = { occupied: true, color: colorClass, label: 'IN 8PM', exactInTime: '8PM' };
                    }

                    if (isDayBeforeCheckOut && outTime === "7AM" && bType === 'full') {
                        dayState.bottom.label = 'OUT 7AM NEXT DAY';
                    }
                }
            } else if (isCheckOutDay) {
                if (bType !== 'evening') {
                    if (outTime === "5PM") {
                        dayState.top = { occupied: true, color: colorClass, label: 'OUT 5PM', exactOutTime: '5PM' };
                    } else if (outTime === "12NN") {
                        dayState.top = { occupied: true, color: colorClass, label: 'OUT 12NN', exactOutTime: '12NN' };
                    }
                }
            }
        });

        return dayState;
    };

    return (
        <section className="bg-white rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden relative">
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

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => setActiveField("checkIn")}
                        className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition ${activeField === "checkIn" ? 'bg-[#D4AF37] text-white shadow-md' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'}`}
                    >
                        Check-in
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveField("checkOut")}
                        className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition ${activeField === "checkOut" ? 'bg-[#D4AF37] text-white shadow-md' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'} ${stayType !== "full" ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        Check-out
                    </button>
                </div>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-7 gap-4">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-zinc-300 uppercase pb-8">{d}</div>
                    ))}

                    {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}

                    {days.map(d => {
                        const currentIterationDay = startOfDay(d);
                        const isHighRate = checkIsHoliday(d, dbHolidays);
                        const isPast = currentIterationDay < startOfDay(new Date());

                        const dayState = getDayStateMap(currentIterationDay);
                        const nextDayState = getDayStateMap(addDays(currentIterationDay, 1));

                        let slotOccupied = false;

                        if (activeField === "checkIn") {
                            if (stayType === 'day') {
                                slotOccupied = dayState.top.occupied;
                            } else if (stayType === 'evening') {
                                slotOccupied = dayState.bottom.occupied;
                            } else if (stayType === 'full') {
                                if (fullStayOption === "9AM-7AM") {
                                    slotOccupied = dayState.top.occupied || dayState.bottom.occupied;
                                } else if (fullStayOption === "8PM-5PM") {
                                    slotOccupied = dayState.bottom.occupied || nextDayState.top.occupied;
                                } else if (fullStayOption === "3PM-12NN") {
                                    const has5PMCheckoutConflict = dayState.top.occupied && dayState.top.exactOutTime === "5PM";
                                    slotOccupied = dayState.bottom.occupied || nextDayState.top.occupied || has5PMCheckoutConflict;
                                }
                            }
                        } else if (activeField === "checkOut") {
                            if (stayType === 'full') {
                                if (fullStayOption === "9AM-7AM") {
                                    slotOccupied = dayState.top.occupied;
                                } else if (fullStayOption === "8PM-5PM") {
                                    slotOccupied = dayState.top.occupied || dayState.bottom.occupied;
                                } else if (fullStayOption === "3PM-12NN") {
                                    slotOccupied = dayState.top.occupied;
                                }

                                if (!slotOccupied && selectedCheckIn) {
                                    if (currentIterationDay <= selectedCheckIn) {
                                        // Visually allowed
                                    } else {
                                        slotOccupied = checkHasMiddleOverlap(selectedCheckIn, currentIterationDay);
                                    }
                                }
                            }
                        }

                        const isSelectable = !slotOccupied && !isPast;
                        const isSelectedCheckIn = selectedCheckIn && isSameDay(currentIterationDay, selectedCheckIn);
                        const isSelectedCheckOut = selectedCheckOut && isSameDay(currentIterationDay, selectedCheckOut);
                        const isInSelectedRange = selectedCheckIn && selectedCheckOut && stayType === "full" && isWithinInterval(currentIterationDay, { start: selectedCheckIn, end: selectedCheckOut });

                        let containerStyles = "border-zinc-100 bg-white";
                        if (isSelectedCheckIn || isSelectedCheckOut) {
                            containerStyles = "ring-2 ring-[#D4AF37] ring-offset-1 scale-[1.02] z-10 shadow-md bg-white border-transparent";
                        } else if (isInSelectedRange) {
                            containerStyles = "bg-[#D4AF37]/5 border-[#D4AF37]/20";
                        } else if (isPast) {
                            containerStyles = "opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-100";
                        } else if (isSelectable) {
                            containerStyles = "hover:border-[#D4AF37]/50 hover:shadow-md cursor-pointer border-zinc-100";
                        } else {
                            containerStyles = "opacity-50 cursor-not-allowed bg-zinc-100/50 border-zinc-200/60";
                        }

                        return (
                            <button
                                key={d.toString()}
                                type="button"
                                onClick={() => isSelectable && handleDayClick(currentIterationDay)}
                                disabled={!isSelectable && !isSelectedCheckIn && !isSelectedCheckOut}
                                className={`h-16 relative flex flex-col rounded-[1.2rem] border transition-all select-none overflow-hidden ${containerStyles}`}
                            >
                                {/* FIXED: Solid bg-white at extended padding settings para hindi tumagos ang slot background colors */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    <span className={`w-[24px] h-[24px] flex items-center justify-center rounded-full text-[11px] font-black shadow-sm border ${isInSelectedRange || isSelectedCheckIn || isSelectedCheckOut
                                            ? 'bg-[#D4AF37] text-white border-transparent'
                                            : 'bg-white text-zinc-800 border-zinc-100'
                                        }`}>
                                        {format(d, "d")}
                                    </span>
                                </div>

                                {/* HOLIDAY INDICATOR DOT */}
                                {isHighRate && !dayState.top.occupied && !dayState.bottom.occupied && (
                                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37] z-20" />
                                )}

                                {/* TOP ZONE DISPLAY (Day Lounge / Morning Slots) */}
                                <div className={`flex-1 w-full flex items-start justify-center pt-1 px-1 overflow-hidden min-h-[50%] max-h-[50%] text-center relative ${dayState.top.occupied ? dayState.top.color : ''} ${isInSelectedRange && !dayState.top.occupied ? 'bg-[#D4AF37]/10' : ''}`}>
                                    {/* FIXED: Dynamic padding logic plus higher internal spacing blocks when text exists */}
                                    {dayState.top.label && (
                                        <span className="text-[5px] tracking-widest uppercase font-black px-1 py-0.5 rounded-sm z-10 bg-black/10 text-current truncate max-w-[85%] mt-0.5">
                                            {dayState.top.label}
                                        </span>
                                    )}
                                </div>

                                {/* BOTTOM ZONE DISPLAY (Evening Chill / Night Slots) */}
                                <div className={`flex-1 w-full flex items-end justify-center pb-1 px-1 overflow-hidden min-h-[50%] max-h-[50%] text-center relative ${dayState.bottom.occupied ? dayState.bottom.color : ''} ${isInSelectedRange && !dayState.bottom.occupied ? 'bg-[#D4AF37]/10' : ''}`}>
                                    {/* FIXED: Added clear boundary targets using max-w percentage locks */}
                                    {dayState.bottom.label && (
                                        <span className="text-[5px] tracking-widest uppercase font-black px-1 py-0.5 rounded-sm z-10 bg-black/10 text-current truncate max-w-[85%] mb-0.5">
                                            {dayState.bottom.label}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
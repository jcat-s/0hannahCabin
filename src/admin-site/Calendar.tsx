import React, { useMemo, useState } from "react";
import {
    format,
    addDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    parseISO,
    subMonths,
    addMonths,
    startOfDay,
    isWithinInterval,
    isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

interface AdminCalendarProps {
    bookings: any[];
}

export function CalendarView({ bookings }: AdminCalendarProps) {
    const [currentViewDate, setCurrentViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthDays = useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(currentViewDate),
            end: endOfMonth(currentViewDate),
        });
    }, [currentViewDate]);

    const firstDow = (startOfMonth(currentViewDate).getDay() + 6) % 7;

    const bookingsByDate = useMemo(() => {
        const map = new Map<string, any[]>();
        const add = (date: Date, booking: any) => {
            const key = format(date, "yyyy-MM-dd");
            const existing = map.get(key) || [];
            map.set(key, [...existing, booking]);
        };

        bookings
            .filter((booking) => booking.status === "Confirmed")
            .forEach((booking) => {
                const start = startOfDay(parseISO(booking.checkInDate || booking.checkIn));
                const end = startOfDay(parseISO(booking.checkOutDate || booking.checkOut));
                eachDayOfInterval({ start, end }).forEach((day) => add(day, booking));
            });

        return map;
    }, [bookings]);

    const selectedBookings = selectedDate ? bookingsByDate.get(format(selectedDate, "yyyy-MM-dd")) || [] : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Admin Calendar</h3>
                    <p className="text-[10px] text-zinc-500 mt-2">Click any booked date to see the reservation details.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))}
                        className="p-3 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="text-sm font-bold uppercase tracking-[0.25em]">{format(currentViewDate, "MMMM yyyy")}</div>
                    <button
                        type="button"
                        onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))}
                        className="p-3 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3 text-center text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-black">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((label) => (
                    <div key={label} className="py-2">{label}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: firstDow }).map((_, index) => (
                    <div key={`empty-${index}`} />
                ))}

                {monthDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayBookings = bookingsByDate.get(key) || [];
                    const booking = dayBookings[0];
                    const hasBooking = dayBookings.length > 0;
                    const colorClass = booking ? CALENDAR_COLORS[booking.color] || "bg-zinc-400" : "bg-white";

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => hasBooking && setSelectedDate(day)}
                            className={`h-20 rounded-[1.2rem] border border-zinc-200 p-3 text-left transition-all ${hasBooking ? 'shadow-sm' : 'bg-white hover:bg-zinc-50'} ${hasBooking ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-zinc-900">{format(day, "d")}</span>
                                {hasBooking && <span className={`inline-flex h-2.5 w-2.5 rounded-full ${colorClass}`} />}
                            </div>
                            {hasBooking && (
                                <div className="mt-3 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">
                                    {dayBookings.length > 1 ? `${dayBookings.length} bookings` : `${booking.customerName}`}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
                    <div className="max-w-3xl w-full rounded-[2rem] bg-white p-8 shadow-2xl">
                        <div className="flex items-center justify-between gap-6 mb-6">
                            <div>
                                <h4 className="text-lg font-black">Bookings on {format(selectedDate, "MMMM d, yyyy")}</h4>
                                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 mt-2">Tap outside or close to return to the calendar.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDate(null)}
                                className="text-sm font-black uppercase text-zinc-500 hover:text-zinc-900"
                            >
                                Close
                            </button>
                        </div>

                        {selectedBookings.length === 0 ? (
                            <div className="rounded-3xl bg-zinc-50 p-8 text-center text-zinc-500">No bookings for this date.</div>
                        ) : (
                            <div className="grid gap-4">
                                {selectedBookings.map((booking, index) => (
                                    <div key={`${booking.id}-${index}`} className="rounded-[2rem] border border-zinc-200 p-6 bg-zinc-50">
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black">{booking.status || 'Booking'}</p>
                                                <h5 className="text-base font-black">{booking.customerName || 'Guest'}</h5>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {booking.status || 'Pending'}
                                            </span>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-3">
                                                <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-black">Cabin</p>
                                                <p className="text-sm font-bold text-zinc-900">{booking.cabin || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-black">Dates</p>
                                                <p className="text-sm font-bold text-zinc-900">{booking.checkIn} → {booking.checkOut}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-black">Color</p>
                                                <p className="text-sm font-bold text-zinc-900">{booking.color || 'None'}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-black">Stay Type</p>
                                                <p className="text-sm font-bold text-zinc-900">{booking.stayType === 'day' ? 'Day Lounge' : booking.stayType === 'evening' ? 'Evening Chill' : 'Full Stay'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-3xl bg-white p-4 border border-zinc-200">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black">Guests</p>
                                                <p className="text-sm font-bold text-zinc-900">Adults: {booking.guests || 0}</p>
                                                <p className="text-sm font-bold text-zinc-900">Kids: {booking.kids || 0}</p>
                                                <p className="text-sm font-bold text-zinc-900">Pets: {booking.pets || 0}</p>
                                            </div>
                                            <div className="rounded-3xl bg-white p-4 border border-zinc-200">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black">Contact</p>
                                                <p className="text-sm font-bold text-zinc-900">{booking.mobile || 'No mobile'}</p>
                                                <p className="text-sm text-zinc-600 break-words">{booking.userEmail || 'No email'}</p>
                                            </div>
                                        </div>

                                        {booking.specialOccasion && (
                                            <div className="mt-6 rounded-3xl bg-white p-4 border border-zinc-200">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black">Occasion</p>
                                                <p className="text-sm font-bold text-zinc-900">{booking.specialOccasion}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

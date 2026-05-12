import React from "react";
import { format, parseISO } from "date-fns";
import { PartyPopper, Users, Baby, Dog, Clock, CalendarDays } from "lucide-react";

// Light shades for background, but the text will stay dark
const PRINT_COLORS: Record<string, string> = {
    pink: "bg-pink-200",
    red: "bg-red-200",
    orange: "bg-orange-200",
    yellow: "bg-yellow-200",
    green: "bg-green-200",
    blue: "bg-blue-200",
    indigo: "bg-indigo-200",
    violet: "bg-violet-200",
};

export const PrintBookingItem = ({ booking }: { booking: any }) => {
    const stayLabels: Record<string, { label: string; time: string }> = {
        day: { label: "Day Lounge", time: "9AM-5PM" },
        evening: { label: "Evening Chill", time: "8PM-7AM" },
        full: { label: "Full Stay", time: "" },
        "9AM-7AM": { label: "Full Stay", time: "9AM-7AM" },
        "8PM-5PM": { label: "Full Stay", time: "8PM-5PM" }
    };

    const getStayDisplay = () => {
        const base = stayLabels[booking.stayType];
        if (booking.stayType === 'full' && booking.fullStayOption) {
            const option = stayLabels[booking.fullStayOption];
            return {
                label: "Full Stay",
                time: option?.time || booking.fullStayOption
            };
        }
        return {
            label: base?.label || booking.stayType,
            time: base?.time || ""
        };
    };

    const display = getStayDisplay();
    const stayRange = `${format(parseISO(booking.checkIn), "MMM d")} - ${format(parseISO(booking.checkOut), "d")}`;

    return (
        <div className={`h-full w-full p-1.5 flex flex-col justify-between ${PRINT_COLORS[booking.color] || 'bg-zinc-200'} border-b border-black/20 print:border-black`}>
            <div className="flex flex-col gap-0.5">
                {/* Customer Name - Pinakaimportante sa Print */}
                <span className="font-black text-[10px] text-black uppercase leading-tight break-words">
                    {booking.customerName}
                </span>

                {/* Stay Type & Time */}
                <div className="flex items-center gap-1 mt-0.5 text-black">
                    <Clock size={8} strokeWidth={3} />
                    <span className="text-[7.5px] font-black uppercase italic">
                        {display.label} {display.time && `(${display.time})`}
                    </span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-1 text-black">
                    <CalendarDays size={8} strokeWidth={3} />
                    <span className="text-[7.5px] font-black uppercase">
                        {stayRange}
                    </span>
                </div>

                {/* Occasion */}
                {booking.specialOccasion && (
                    <div className="flex items-center gap-1 text-black">
                        <PartyPopper size={8} strokeWidth={3} />
                        <span className="text-[7.5px] font-black uppercase italic truncate">
                            {booking.specialOccasion}
                        </span>
                    </div>
                )}
            </div>

            {/* PAX Summary - High Contrast Bottom Bar */}
            <div className="border-t-[1.5px] border-black/30 pt-1 flex flex-wrap gap-x-2 gap-y-0 mt-auto">
                <div className="flex items-center gap-0.5 text-black">
                    <Users size={8} strokeWidth={3} />
                    <span className="text-[8px] font-black">{booking.guests}</span>
                </div>
                {booking.kids > 0 && (
                    <div className="flex items-center gap-0.5 text-black">
                        <Baby size={8} strokeWidth={3} />
                        <span className="text-[8px] font-black">{booking.kids}K</span>
                    </div>
                )}
                {booking.pets > 0 && (
                    <div className="flex items-center gap-0.5 text-black">
                        <Dog size={8} strokeWidth={3} />
                        <span className="text-[8px] font-black">{booking.pets}P</span>
                    </div>
                )}
            </div>
        </div>
    );
};
import React from "react";
import { format, parseISO } from "date-fns";
import { PartyPopper, Users, Baby, Dog, Clock, CalendarDays } from "lucide-react";

const PRINT_COLORS: Record<string, string> = {
    pink: "bg-pink-100",
    red: "bg-red-100",
    orange: "bg-orange-100",
    yellow: "bg-yellow-100",
    green: "bg-green-100",
    blue: "bg-blue-100",
    indigo: "bg-indigo-100",
    violet: "bg-violet-100",
};

export const PrintBookingItem = ({ booking }: { booking: any }) => {
    const stayLabels: Record<string, { label: string; time: string }> = {
        day: { label: "Day Lounge", time: "9AM-5PM" },
        evening: { label: "Evening Chill", time: "8PM-7AM" },
        full: { label: "Full Stay", time: "" }
    };

    const getStayDisplay = () => {
        const base = stayLabels[booking.stayType];
        if (booking.stayType === 'full' && booking.fullStayOption) {
            return { label: "Full Stay", time: booking.fullStayOption };
        }
        return { label: base?.label || booking.stayType, time: base?.time || "" };
    };

    const display = getStayDisplay();
    const stayRange = `${format(parseISO(booking.checkIn), "MMM d")} - ${format(parseISO(booking.checkOut), "d")}`;

    return (
        <div className={`flex-1 w-full p-2 flex flex-col justify-between ${PRINT_COLORS[booking.color] || 'bg-zinc-100'} border-l-4 border-black/20`}>
            <div className="space-y-1">
                {/* Header: Name */}
                <h4 className="font-black text-[11px] text-black uppercase leading-tight line-clamp-2">
                    {booking.customerName}
                </h4>

                {/* Info Rows */}
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-black/80">
                        <Clock size={9} strokeWidth={3} />
                        <span className="text-[8px] font-black uppercase italic">
                            {display.label} {display.time && `(${display.time})`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-black/80">
                        <CalendarDays size={9} strokeWidth={3} />
                        <span className="text-[8px] font-black uppercase">{stayRange}</span>
                    </div>
                    {booking.specialOccasion && (
                        <div className="flex items-center gap-1 text-blue-800">
                            <PartyPopper size={9} strokeWidth={3} />
                            <span className="text-[8px] font-black uppercase truncate">{booking.specialOccasion}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: PAX */}
            <div className="mt-2 pt-1 border-t border-black/10 flex gap-2">
                <div className="flex items-center gap-0.5">
                    <Users size={10} strokeWidth={3} />
                    <span className="text-[9px] font-bold">{booking.guests}</span>
                </div>
                {booking.kids > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Baby size={10} strokeWidth={3} />
                        <span className="text-[9px] font-bold">{booking.kids}K</span>
                    </div>
                )}
                {booking.pets > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Dog size={10} strokeWidth={3} />
                        <span className="text-[9px] font-bold">{booking.pets}P</span>
                    </div>
                )}
            </div>
        </div>
    );
};
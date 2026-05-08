import React from "react";
import { format, parseISO } from "date-fns";
import { PartyPopper, Users, Baby, Dog, Clock, CalendarDays } from "lucide-react";

// COLORS FOR PRINT
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

interface PrintCalendarProps {
    booking: any;
}

export const PrintBookingItem = ({ booking }: PrintCalendarProps) => {
    const timeLabel = {
        day: "9AM-5PM",
        evening: "8PM-7AM",
        full: "9AM-7AM"
    }[booking.stayType as 'day' | 'evening' | 'full'] || "";

    // Halimbawa: Feb 2 - 5
    const stayRange = `${format(parseISO(booking.checkIn), "MMM d")} - ${format(parseISO(booking.checkOut), "d")}`;

    return (
        <div className={`h-full w-full p-1 flex flex-col justify-between ${PRINT_COLORS[booking.color] || 'bg-zinc-200'} overflow-hidden`}>
            <div className="flex flex-col gap-0.5">
                {/* Name */}
                <span className="font-black text-[9px] uppercase leading-none truncate">
                    {booking.customerName}
                </span>

                {/* Type & Time */}
                <div className="flex items-center gap-1 leading-none mt-0.5">
                    <Clock size={7} strokeWidth={3} />
                    <span className="text-[7px] font-black italic uppercase">
                        {booking.stayType} ({timeLabel})
                    </span>
                </div>



                {/* Length of Stay */}
                <div className="flex items-center gap-1 text-black/70 leading-none">
                    <CalendarDays size={7} strokeWidth={3} />
                    <span className="text-[7px] font-black uppercase truncate">
                        {stayRange}
                    </span>
                </div>



                {/* Occasion - Same Style */}
                {booking.specialOccasion && (
                    <div className="flex items-center gap-1 leading-none">
                        <PartyPopper size={7} strokeWidth={3} />
                        <span className="text-[7px] font-black uppercase italic">
                            {booking.specialOccasion}
                        </span>
                    </div>
                )}


            </div>

            {/* Pax Details */}
            <div className="border-t border-black/10 pt-0.5 flex flex-wrap gap-x-1.5 gap-y-0 mt-auto">
                <div className="flex items-center gap-0.5">
                    <Users size={8} strokeWidth={3} />
                    <span className="text-[8px] font-black">{booking.guests} PAX</span>
                </div>
                {booking.kids > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Baby size={8} strokeWidth={3} />
                        <span className="text-[8px] font-black">{booking.kids} KIDS</span>
                    </div>
                )}
                {booking.pets > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Dog size={8} strokeWidth={3} />
                        <span className="text-[8px] font-black">{booking.pets} PETS</span>
                    </div>
                )}
            </div>
        </div>
    );
};
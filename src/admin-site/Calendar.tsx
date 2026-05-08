import React, { useMemo, useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    parseISO,
    subMonths,
    addMonths,
    isSameDay,
    getDaysInMonth,
} from "date-fns";
import {
    ChevronLeft, ChevronRight, Printer,
    PartyPopper, Users, Baby, Dog, Clock, CalendarDays
} from "lucide-react";

const PRINT_COLORS: Record<string, string> = {
    pink: "bg-[#fbcfe8]",
    red: "bg-[#fecaca]",
    orange: "bg-[#fed7aa]",
    yellow: "bg-[#fef08a]",
    green: "bg-[#bbf7d0]",
    blue: "bg-[#bfdbfe]",
    indigo: "bg-[#c7d2fe]",
    violet: "bg-[#ddd6fe]",
};

export function CalendarView({ bookings }: { bookings: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCabin, setSelectedCabin] = useState<"ohannah" | "dream">("ohannah");

    const filteredBookings = useMemo(() => {
        return bookings.filter(b =>
            b.status === "Confirmed" &&
            b.cabin?.toLowerCase().includes(selectedCabin)
        );
    }, [bookings, selectedCabin]);

    return (
        <div className="min-h-screen bg-zinc-100 print:bg-white font-sans">
            {/* --- CONTROLS: HIDDEN ON PRINT --- */}
            <div className="p-4 bg-zinc-950 flex items-center justify-between print:hidden sticky top-0 z-[100]">
                <div className="flex gap-2">
                    {["ohannah", "dream"].map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedCabin(c as any)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedCabin === c ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
                        >
                            {c === "ohannah" ? "Ohannah Cabin" : "The Dream"}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6 text-white">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft size={24} /></button>
                    <h3 className="text-lg font-black uppercase tracking-widest">{format(currentDate, "MMMM yyyy")}</h3>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight size={24} /></button>
                </div>

                <button onClick={() => window.print()} className="bg-zinc-800 text-white px-8 py-2 rounded-lg font-black text-[12px] flex items-center gap-2">
                    <Printer size={16} /> PRINT CALENDAR
                </button>
            </div>

            {/* --- PRINT AREA --- */}
            <div id="print-content" className="w-full mx-auto bg-white p-12 print:p-0 min-h-screen flex flex-col print:shadow-none shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-baseline gap-2 leading-none">
                            <h1 className="text-7xl font-serif font-black uppercase tracking-tighter text-zinc-800">
                                {format(currentDate, "MMMM")}
                            </h1>
                            <span className="text-2xl font-serif font-bold text-zinc-400 tracking-widest uppercase ml-4">Bookings</span>
                        </div>
                        <h2 className="text-6xl font-serif font-light text-zinc-300 -mt-2">{format(currentDate, "yyyy")}</h2>
                    </div>
                    <div className="text-right">
                        <img
                            src={selectedCabin === 'dream' ? "/section/dream.png" : "/section/logo.png"}
                            alt="Logo"
                            className="h-16 object-contain grayscale opacity-80"
                        />
                    </div>
                </div>

                {/* THE GRID */}
                <div className="flex-1 flex flex-col relative">
                    <div className="grid grid-cols-7 ml-[50px] border-t-2 border-zinc-300">
                        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(d => (
                            <div key={d} className="py-1 text-center font-bold text-[9px] tracking-[0.2em] text-zinc-500">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col border-[2px] border-black ml-[50px] relative overflow-hidden">
                        {renderPrintGrid(currentDate, filteredBookings)}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 5mm; }
                    html, body { height: 100%; margin: 0 !important; padding: 0 !important; overflow: hidden; }
                    .print\\:hidden { display: none !important; }
                    #print-content { 
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100vw !important; 
                        height: 100vh !important; 
                        padding: 5mm !important;
                        margin: 0 !important;
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .day-box { 
                    border-right: 1.5px solid black; 
                    border-bottom: 1.5px solid black; 
                    position: relative; 
                    flex: 1; 
                    min-height: 0;
                    min-width: 0;
                }
                .day-box:nth-child(7n) { border-right: 0; }
                .calendar-row { flex: 1; display: flex; min-height: 0; }
            `}</style>
        </div>
    );
}

function renderPrintGrid(month: Date, bookings: any[]) {
    const start = startOfMonth(month);
    const startDay = start.getDay();
    const daysInMonth = getDaysInMonth(month);
    const totalSlots = (startDay + daysInMonth) > 35 ? 42 : 35;

    const gridData = Array(totalSlots).fill(null);
    const actualDays = eachDayOfInterval({ start, end: endOfMonth(month) });
    actualDays.forEach((day, i) => { gridData[startDay + i] = day; });

    const rows = [];
    for (let i = 0; i < gridData.length; i += 7) rows.push(gridData.slice(i, i + 7));

    return rows.map((week, wIdx) => (
        <div key={wIdx} className="calendar-row border-b-[2px] last:border-b-0 border-black">
            {week.map((day, dIdx) => {
                const booking = day ? bookings.find(b => isSameDay(parseISO(b.checkIn), day)) : null;

                return (
                    <div key={dIdx} className={`day-box ${!day ? 'bg-zinc-50' : 'bg-white'}`}>
                        {day && (
                            <>
                                <span className="absolute top-0.5 left-1 font-bold text-lg text-zinc-300 z-0 select-none">
                                    {format(day, "d")}
                                </span>

                                <div className="absolute inset-0 z-10">
                                    {booking && <BookingContent booking={booking} />}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    ));
}

function BookingContent({ booking }: { booking: any }) {
    const timeLabel = {
        day: "9AM-5PM",
        evening: "8PM-7AM",
        full: "9AM-7AM"
    }[booking.stayType as 'day' | 'evening' | 'full'] || "";

    // Stay Length Format: "Feb 2 - 10"
    const stayRange = `${format(parseISO(booking.checkIn), "MMM d")} - ${format(parseISO(booking.checkOut), "d")}`;

    return (
        <div className={`h-full w-full p-1 flex flex-col justify-between ${PRINT_COLORS[booking.color] || 'bg-zinc-200'} overflow-hidden`}>
            <div className="flex flex-col gap-0.5">
                {/* 1. Name */}
                <span className="font-black text-[9px] uppercase leading-tight truncate">
                    {booking.customerName}
                </span>

                {/* 2. Stay Type & Time */}
                <div className="flex items-center gap-1">
                    <Clock size={7} strokeWidth={3} />
                    <span className="text-[7px] font-black italic uppercase">
                        {booking.stayType} ({timeLabel})
                    </span>
                </div>

                {/* 3. Occasion (Same style as time) */}
                {booking.specialOccasion && (
                    <div className="flex items-center gap-1">
                        <PartyPopper size={7} strokeWidth={3} />
                        <span className="text-[7px] font-black uppercase truncate">
                            {booking.specialOccasion}
                        </span>
                    </div>
                )}

                {/* 4. Stay Dates (Length of stay) */}
                <div className="flex items-center gap-1 text-black/70">
                    <CalendarDays size={7} strokeWidth={3} />
                    <span className="text-[7px] font-bold uppercase italic">
                        {stayRange}
                    </span>
                </div>
            </div>

            {/* 5. Bottom Pax Details */}
            <div className="border-t border-black/10 pt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5 mt-auto">
                <div className="flex items-center gap-0.5">
                    <Users size={8} strokeWidth={3} />
                    <span className="text-[8px] font-black">{booking.guests} </span>
                </div>
                {booking.kids > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Baby size={8} strokeWidth={3} />
                        <span className="text-[8px] font-black leading-none">{booking.kids} KIDS</span>
                    </div>
                )}
                {booking.pets > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Dog size={8} strokeWidth={3} />
                        <span className="text-[8px] font-black leading-none">{booking.pets} PETS</span>
                    </div>
                )}
            </div>
        </div>
    );
}
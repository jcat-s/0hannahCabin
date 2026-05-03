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
    getDate,
    getDaysInMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

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
            {/* CONTROLS - HIDDEN ON PRINT */}
            <div className="p-4 bg-zinc-950 flex items-center justify-between print:hidden sticky top-0 z-[100]">
                <div className="flex gap-2">
                    {["ohannah", "dream"].map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedCabin(c as any)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedCabin === c ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                                }`}
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

            {/* PRINT AREA */}
            <div id="print-content" className="w-full mx-auto bg-white p-12 print:p-0 min-h-screen flex flex-col">

                {/* HEADER - GAYANG GAYA SA PIC */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-baseline gap-2 leading-none">
                            <h1 className="text-8xl font-serif font-black uppercase tracking-tighter text-zinc-800">
                                {format(currentDate, "MMMM")}
                            </h1>
                            <span className="text-3xl font-serif font-bold text-zinc-400 tracking-widest uppercase ml-4">Bookings</span>
                        </div>
                        <h2 className="text-7xl font-serif font-light text-zinc-300 -mt-2">{format(currentDate, "yyyy")}</h2>
                    </div>
                    <div className="text-right">
                        <img
                            src={selectedCabin === 'dream' ? "/section/dream.png" : "/section/logo.png"}
                            alt="Logo"
                            className="h-20 object-contain grayscale opacity-80"
                        />
                    </div>
                </div>

                {/* THE GRID CONTAINER */}
                <div className="flex-1 flex flex-col relative">
                    {/* WEEKDAYS */}
                    <div className="grid grid-cols-7 ml-[50px] border-t-2 border-zinc-300">
                        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(d => (
                            <div key={d} className="py-2 text-center font-bold text-[10px] tracking-[0.2em] text-zinc-500">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* CALENDAR BODY */}
                    <div className="flex-1 flex flex-col border-[2px] border-black ml-[50px] relative">
                        {renderPrintGrid(currentDate, filteredBookings)}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body { background: white; -webkit-print-color-adjust: exact !important; }
                    .print\\:hidden { display: none !important; }
                    #print-content { width: 100% !important; height: 95vh !important; }
                }
                .day-box { border-right: 1.5px solid black; border-bottom: 1.5px solid black; position: relative; display: flex; flex-direction: column; min-height: 0; }
                .day-box:nth-child(7n) { border-right: 0; }
                .time-label-container { position: absolute; left: -50px; width: 45px; height: 100%; display: flex; flex-direction: column; justify-content: space-around; font-size: 8px; font-weight: 900; line-height: 1; text-align: right; padding-right: 5px; color: #666; }
                .slot-border { flex: 1; border-bottom: 1px solid #eee; display: flex; flex-direction: column; min-height: 0; }
                .slot-border:last-child { border-bottom: 0; }
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
        <div key={wIdx} className="flex-1 grid grid-cols-7 relative border-b-[2px] last:border-b-0 border-black">
            {/* FLOATING LABELS ON THE LEFT SIDE (OUTSIDE GRID) */}
            <div className="time-label-container">
                <div className="flex-1 flex items-center justify-end pb-4">9AM<br />to<br />5PM</div>
                <div className="flex-1 flex items-center justify-end pt-4">8PM<br />to<br />7AM</div>
            </div>

            {week.map((day, dIdx) => {
                const dBook = day ? bookings.find(b => isSameDay(parseISO(b.checkIn), day) && (b.stayType === 'day' || b.stayType === 'full')) : null;
                const nBook = day ? bookings.find(b => isSameDay(parseISO(b.checkIn), day) && (b.stayType === 'evening' || b.stayType === 'full')) : null;

                return (
                    <div key={dIdx} className={`day-box ${!day ? 'bg-zinc-50' : ''}`}>
                        {day && (
                            <span className="absolute top-1 left-1.5 font-bold text-xl text-zinc-400">
                                {format(day, "d")}
                            </span>
                        )}
                        <div className="flex flex-col h-full">
                            <div className="slot-border pt-6">
                                <BookingCell booking={dBook} />
                            </div>
                            <div className="slot-border">
                                <BookingCell booking={day?.stayType === 'full' ? dBook : nBook} isCont={day?.stayType === 'full'} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    ));
}

function BookingCell({ booking, isCont }: { booking: any, isCont?: boolean }) {
    if (!booking) return <div className="flex-1" />;
    const start = getDate(parseISO(booking.checkIn));
    const end = getDate(parseISO(booking.checkOut));
    const range = start !== end ? `${start}-${end}` : null;

    return (
        <div className={`flex-1 p-1.5 text-[9px] font-black uppercase leading-[1.1] overflow-hidden ${PRINT_COLORS[booking.color] || 'bg-zinc-200'}`}>
            {!isCont ? (
                <>
                    <div className="border-b border-black/20 mb-0.5 flex justify-between items-center">
                        <span className="truncate pr-1">{booking.customerName}</span>
                        {range && <span className="underline shrink-0 text-[10px]">{range}</span>}
                    </div>
                    <div className="flex gap-1.5 text-[8px] font-bold opacity-70">
                        <span>{booking.guests}PX</span>
                        {booking.kids > 0 && <span>{booking.kids}K</span>}
                        {booking.pets > 0 && <span>{booking.pets}P</span>}
                    </div>
                </>
            ) : (
                <div className="h-full flex items-center justify-center opacity-20 text-[7px] italic italic">CONT...</div>
            )}
        </div>
    );
}
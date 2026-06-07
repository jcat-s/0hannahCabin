import React, { useMemo, useState } from "react";
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    parseISO, subMonths, addMonths, isSameDay, getDaysInMonth,
    setMonth, setYear, getYear, subDays
} from "date-fns";
import { ChevronLeft, ChevronRight, Printer, X, Calendar as CalendarIcon, PartyPopper, Users, Baby, Dog, Clock, CalendarDays, Tag } from "lucide-react";

// --- SUB-COMPONENT: PRINT BOOKING ITEM ---
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

export const PrintBookingItem = ({
    booking,
    isCompact = false,
    hideDateRange = false,
    renderMode = "full"
}: {
    booking: any;
    isCompact?: boolean;
    hideDateRange?: boolean;
    renderMode?: "full" | "header" | "details";
}) => {
    const stayLabels: Record<string, { label: string; time: string }> = {
        day: { label: "Day Lounge", time: "9AM-5PM" },
        evening: { label: "Evening Chill", time: "8PM-7AM" },
        full: { label: "Full Stay", time: "" },
        "9AM-7AM": { label: "Full Stay", time: "9AM-7AM" },
        "8PM-5PM": { label: "Full Stay", time: "8PM-5PM" },
        "3PM-12NN": { label: "Full Stay", time: "3PM-12NN" }
    };

    const getStayDisplay = () => {
        const base = stayLabels[booking.stayType];
        if (booking.stayType === 'full' && booking.fullStayOption) {
            const option = stayLabels[booking.fullStayOption];
            return { label: "Full Stay", time: option?.time || booking.fullStayOption };
        }
        return { label: base?.label || booking.stayType, time: base?.time || "" };
    };

    const display = getStayDisplay();
    const stayRange = `${format(parseISO(booking.checkIn), "MMM d")} - ${format(parseISO(booking.checkOut), "d")}`;
    const isSingleDayType = booking.stayType === "day" || booking.stayType === "evening";

    return (
        <div className={`h-full w-full p-1.5 flex flex-col justify-between overflow-hidden ${PRINT_COLORS[booking.color] || 'bg-zinc-200'} border-l-4 border-black/20`}>
            <div className="flex flex-col gap-0.5 relative z-10">

                {/* PANGALAN */}
                {(renderMode === "full" || renderMode === "header") && (
                    <span className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-black leading-tight break-words line-clamp-2`}>
                        {booking.customerName}
                    </span>
                )}

                {/* TIMING & DATE RANGE */}
                {isSingleDayType ? (
                    !hideDateRange && (
                        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-black">
                            <div className="flex items-center gap-1">
                                <CalendarDays size={isCompact ? 7 : 9} strokeWidth={3} />
                                <span className={`${isCompact ? 'text-[7px]' : 'text-[8px]'} font-black uppercase truncate`}>
                                    {stayRange}
                                </span>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        {(renderMode === "header") && (
                            <div className="flex items-center gap-1 text-black">
                                <Clock size={isCompact ? 7 : 9} strokeWidth={3} />
                                <span className={`${isCompact ? 'text-[7px]' : 'text-[8px]'} font-black uppercase italic truncate`}>
                                    {display.label} {display.time && `(${display.time})`}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-black">
                            <div className="flex items-center gap-1">
                                <CalendarDays size={isCompact ? 7 : 9} strokeWidth={3} />
                                <span className={`${isCompact ? 'text-[7px]' : 'text-[8px]'} font-black uppercase truncate`}>
                                    {stayRange}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                {/* OCCASION ONLY */}
                {(renderMode === "full" || renderMode === "details") && booking.specialOccasion && (
                    <div className="flex items-center gap-1 text-blue-900 mt-0.5">
                        <PartyPopper size={isCompact ? 7 : 9} strokeWidth={3} />
                        <span className={`${isCompact ? 'text-[7px]' : 'text-[8px]'} font-black italic truncate`}>
                            {booking.specialOccasion}
                        </span>
                    </div>
                )}
            </div>

            {/* PAX METADATA & DISCOUNT TAG */}
            {(renderMode === "full" || renderMode === "details") && (
                <div className={`border-t border-black/20 pt-1 flex items-center justify-between mt-auto relative z-10 ${isCompact ? 'text-[5px]' : 'text-[8px]'}`}>
                    <div className="flex flex-wrap gap-x-2">
                        <div className="flex items-center gap-0.5 text-black">
                            <Users size={isCompact ? 8 : 10} strokeWidth={3} />
                            <span className="font-black">{booking.guests || booking.pax}</span>
                        </div>
                        {booking.kids > 0 && (
                            <div className="flex items-center gap-0.5 text-black">
                                <Baby size={isCompact ? 8 : 10} strokeWidth={3} />
                                <span className="font-black">{booking.kids}K</span>
                            </div>
                        )}
                        {booking.pets > 0 && (
                            <div className="flex items-center gap-0.5 text-black">
                                <Dog size={isCompact ? 8 : 10} strokeWidth={3} />
                                <span className="font-black">{booking.pets}P</span>
                            </div>
                        )}
                    </div>

                    {/* Discount Tag on the right side of Pax Metadata */}
                    {(booking.discount || booking.discountCode) && (
                        <div className="flex items-center gap-0.5 text-rose-700 ml-auto">
                            <Tag size={isCompact ? 8 : 10} strokeWidth={3} />
                            <span className="font-black">{booking.discount}Discounted</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT: CALENDAR VIEW ---
export function CalendarView({ bookings }: { bookings: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCabin, setSelectedCabin] = useState<"ohannah" | "dream">("ohannah");
    const [showPicker, setShowPicker] = useState(false);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b =>
            b.status === "Confirmed" &&
            b.cabin?.toLowerCase().includes(selectedCabin)
        );
    }, [bookings, selectedCabin]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
    }, []);

    const handleMonthChange = (monthIdx: number) => setCurrentDate(setMonth(currentDate, monthIdx));
    const handleYearChange = (year: number) => setCurrentDate(setYear(currentDate, year));

    const getSlotMarkers = (b: any) => {
        const type = String(b.stayType || '').toLowerCase();
        const slotStr = String(b.fullStayOption || b.timeSlot || b.stayCategory || '').toUpperCase();

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
        return { inTime: "3PM", outTime: "12NN" };
    };

    function renderPrintGrid(month: Date, bookings: any[]) {
        const start = startOfMonth(month);
        const originalStartDay = start.getDay();
        const startDayISO = originalStartDay === 0 ? 6 : originalStartDay - 1;

        const daysInMonth = getDaysInMonth(month);
        const totalSlots = (startDayISO + daysInMonth) > 35 ? 42 : 35;

        const gridData = Array(totalSlots).fill(null);
        const actualDays = eachDayOfInterval({ start, end: endOfMonth(month) });
        actualDays.forEach((day, i) => { gridData[startDayISO + i] = day; });

        const rows = [];
        for (let i = 0; i < gridData.length; i += 7) rows.push(gridData.slice(i, i + 7));

        return rows.map((week, wIdx) => (
            <div key={wIdx} className="calendar-row border-b-2 border-black last:border-b-0">
                {week.map((day, dIdx) => {
                    if (!day) {
                        return <div key={dIdx} className="day-box overflow-hidden bg-zinc-50" />;
                    }

                    const bookingsForDay = bookings.filter(b => {
                        const bStart = parseISO(b.checkIn);
                        const bEnd = parseISO(b.checkOut);
                        const type = String(b.stayType).toLowerCase();

                        if (type === 'day' || type === 'evening') {
                            return isSameDay(bStart, day);
                        }
                        return day >= bStart && day <= bEnd;
                    });

                    const dayBooking = bookingsForDay.find(b => String(b.stayType).toLowerCase() === 'day');
                    const eveningBooking = bookingsForDay.find(b => String(b.stayType).toLowerCase() === 'evening');

                    let fullBookingTop: any = null;
                    let fullBookingBottom: any = null;
                    let isTopBlankReserved = false;
                    let isBottomBlankReserved = false;

                    bookingsForDay.forEach(b => {
                        const type = String(b.stayType).toLowerCase();
                        if (type === 'day' || type === 'evening') return;

                        const { inTime, outTime } = getSlotMarkers(b);
                        const bStart = parseISO(b.checkIn);
                        const bEnd = parseISO(b.checkOut);

                        // --- TOP ZONE ROUTING ---
                        if (inTime === "9AM") {
                            if (day >= bStart && day < bEnd) {
                                if (isSameDay(day, bStart)) {
                                    fullBookingTop = { booking: b, mode: "header" };
                                } else {
                                    isTopBlankReserved = true;
                                }
                            }
                        } else if (inTime === "3PM" || inTime === "8PM") {
                            if (day > bStart && day < bEnd) {
                                isTopBlankReserved = true;
                            }
                        }

                        if (outTime === "12NN" || outTime === "5PM") {
                            if (isSameDay(day, bEnd)) {
                                fullBookingTop = { booking: b, mode: "details" };
                            }
                        }

                        // --- BOTTOM ZONE ROUTING ---
                        if ((outTime === "12NN" || outTime === "5PM") && inTime !== "9AM") {
                            if (day >= bStart && day < bEnd) {
                                if (isSameDay(day, bStart) && (inTime === "3PM" || inTime === "8PM")) {
                                    fullBookingBottom = { booking: b, mode: "header" };
                                } else {
                                    isBottomBlankReserved = true;
                                }
                            }
                        }

                        if (outTime === "7AM") {
                            const targetEveDay = subDays(bEnd, 1);

                            if (isSameDay(day, targetEveDay)) {
                                fullBookingBottom = { booking: b, mode: "details" };
                            } else if (day >= bStart && day < targetEveDay) {
                                if (isSameDay(day, bStart) && inTime !== "9AM") {
                                    fullBookingBottom = { booking: b, mode: "header" };
                                } else {
                                    isBottomBlankReserved = true;
                                }
                            }
                        }
                    });

                    return (
                        <div key={dIdx} className="day-box overflow-hidden bg-white relative">
                            <span className="absolute top-1 left-2 font-bold text-base text-zinc-300 z-0 select-none opacity-50">
                                {format(day, "d")}
                            </span>

                            <div className="absolute top-0 left-0 right-0 bottom-0 z-10 flex flex-col h-full overflow-hidden">
                                {/* Top Zone (Day Lounge Shift) */}
                                <div className="flex-1 min-h-[50%] border-b border-dashed border-black/10 overflow-hidden relative">
                                    {dayBooking ? (
                                        <PrintBookingItem booking={dayBooking} isCompact={true} hideDateRange={true} renderMode="full" />
                                    ) : fullBookingTop ? (
                                        <PrintBookingItem booking={fullBookingTop.booking} isCompact={true} hideDateRange={false} renderMode={fullBookingTop.mode} />
                                    ) : isTopBlankReserved ? (
                                        <div className="w-full h-full bg-zinc-100/30" />
                                    ) : (
                                        <span className="absolute bottom-1 right-2 text-[6px] text-zinc-300 font-bold uppercase tracking-wider select-none">Day Vacant</span>
                                    )}
                                </div>

                                {/* Bottom Zone (Evening Chill Shift) */}
                                <div className="flex-1 min-h-[50%] overflow-hidden relative">
                                    {eveningBooking ? (
                                        <PrintBookingItem booking={eveningBooking} isCompact={true} hideDateRange={true} renderMode="full" />
                                    ) : fullBookingBottom ? (
                                        <PrintBookingItem booking={fullBookingBottom.booking} isCompact={true} hideDateRange={false} renderMode={fullBookingBottom.mode} />
                                    ) : isBottomBlankReserved ? (
                                        <div className="w-full h-full bg-zinc-100/30" />
                                    ) : (
                                        <span className="absolute bottom-1 right-2 text-[6px] text-zinc-300 font-bold uppercase tracking-wider select-none">Eve Vacant</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ));
    }

    return (
        <div className="min-h-screen bg-zinc-100 print:bg-white font-sans overflow-x-auto selection-wrapper">
            {/* CONTROLS */}
            <div className="p-4 bg-zinc-950 flex items-center justify-between print:hidden sticky top-0 z-[100] min-w-[1120px] w-full">
                <div className="flex gap-2">
                    {["ohannah", "dream"].map((c) => (
                        <button key={c} onClick={() => setSelectedCabin(c as any)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedCabin === c ? "bg-white text-black scale-105" : "text-zinc-500 hover:text-white"}`}>
                            {c === "ohannah" ? "Ohannah Cabin" : "The Dream"}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-6 text-white">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:scale-125 transition-transform"><ChevronLeft size={24} /></button>
                    <button onClick={() => setShowPicker(true)} className="group flex flex-col items-center px-4 py-1 hover:bg-white/10 rounded-xl transition-all">
                        <h3 className="text-lg font-black uppercase tracking-widest min-w-[200px] text-center group-hover:text-[#D4AF37]">{format(currentDate, "MMMM yyyy")}</h3>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Click to Change</span>
                    </button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="hover:scale-125 transition-transform"><ChevronRight size={24} /></button>
                </div>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-black text-[12px] flex items-center gap-2 transition-colors">
                    <Printer size={16} /> PRINT CALENDAR
                </button>
            </div>

            {/* QUICK PICKER MODAL */}
            {showPicker && (
                <div className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6 print:hidden">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setShowPicker(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={24} /></button>
                        <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-6">
                            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-[#D4AF37]"><CalendarIcon size={24} /></div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter">Jump to Date</h4>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select month and year to view</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Select Month</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {months.map((m, idx) => (
                                        <button key={m} onClick={() => handleMonthChange(idx)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentDate.getMonth() === idx ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"}`}>{m.substring(0, 3)}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Select Year</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {years.map((y) => (
                                        <button key={y} onClick={() => handleYearChange(y)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getYear(currentDate) === y ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"}`}>{y}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowPicker(false)} className="w-full mt-10 py-5 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20">Apply Selection</button>
                    </div>
                </div>
            )}

            {/* CANVAS DISPLAY */}
            <div className="fixed-canvas-container py-12 print:p-0">
                <div id="print-content" className="print-canvas bg-white p-8 print:p-0 flex flex-col shadow-2xl print:shadow-none mx-auto">
                    <div className="flex justify-between items-start mb-2 flex-shrink-0">
                        <div>
                            <div className="flex items-baseline gap-2 leading-none">
                                <h1 className="text-6xl font-serif font-black uppercase tracking-tighter text-zinc-800">{format(currentDate, "MMMM")}</h1>
                                <span className="text-xl font-serif font-bold text-zinc-400 tracking-widest uppercase ml-2">Bookings</span>
                            </div>
                            <h2 className="text-4xl font-serif font-light text-zinc-300 mt-1">{format(currentDate, "yyyy")}</h2>
                        </div>

                        {/* THE GRID POSITIONING SLOT LEGEND */}
                        <div className="flex flex-col items-end gap-1 border-2 border-black/40 rounded-xl p-2 bg-zinc-50/50">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5 border-b border-zinc-200 w-full text-right pb-0.5">Grid Guide</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-zinc-300/40 rounded border border-dashed border-black/20"></span>
                                <span className="text-[7.5px] font-black text-zinc-700 uppercase">Top Block: Day Lounge (9AM - 5PM / Checkout 12NN, 5PM)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-zinc-300/40 rounded"></span>
                                <span className="text-[7.5px] font-black text-zinc-700 uppercase">Bottom Block: Evening Chill (8PM - 7AM / Checkout 7AM)</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <img src={selectedCabin === 'dream' ? "/section/dream.png" : "/section/logo.png"} alt="Logo" className="h-14 object-contain grayscale opacity-80" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative min-h-0">
                        <div className="grid grid-cols-7 border-t-2 border-zinc-300 flex-shrink-0">
                            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(d => (
                                <div key={d} className="py-1 text-center font-bold text-[8px] tracking-[0.15em] text-zinc-500">{d}</div>
                            ))}
                        </div>
                        <div className="flex-1 flex flex-col border-2 border-black relative overflow-hidden min-h-0">
                            {renderPrintGrid(currentDate, filteredBookings)}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .selection-wrapper {
                    min-width: 1120px;
                }
                .fixed-canvas-container {
                    min-width: 1120px;
                    display: flex;
                    justify-content: center;
                }
                .print-canvas {
                    width: 1056px;
                    height: 744px;
                    max-height: 744px;
                    box-sizing: border-box;
                }
                .calendar-row {
                    flex: 1;
                    display: flex;
                    min-height: 0;
                }
                .day-box {
                    border-right: 2px solid black;
                    position: relative;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    height: 100%;
                }
                .day-box:last-child {
                    border-right: none;
                }

                @media print {
                    @page { 
                        size: A4 landscape; 
                        margin: 0 !important; 
                    }
                    html, body {
                        width: 100vw !important;
                        height: 100vh !important;
                        overflow: hidden !important;
                    }
                    body * { 
                        visibility: hidden; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                    #print-content, #print-content * { 
                        visibility: visible; 
                    }
                    #print-content { 
                        position: fixed !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 100vw !important; 
                        height: 100vh !important; 
                        max-width: 100vw !important;
                        max-height: 100vh !important;
                        margin: 0 !important; 
                        padding: 12mm !important; 
                        background: white !important; 
                        z-index: 9999;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .print\:hidden { display: none !important; }
                    .calendar-row { border-bottom: 2px solid black !important; }
                    .day-box { border-right: 2px solid black !important; }
                    .day-box:last-child { border-right: none !important; }
                }
            `}</style>
        </div>
    );
}
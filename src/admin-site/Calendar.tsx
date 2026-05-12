import React, { useMemo, useState } from "react";
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    parseISO, subMonths, addMonths, isSameDay, getDaysInMonth,
    setMonth, setYear, getYear
} from "date-fns";
import { ChevronLeft, ChevronRight, Printer, X, Calendar as CalendarIcon } from "lucide-react";
import { PrintBookingItem } from "./PrintCalendar";

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

    // Helpers para sa Manual Picker
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
    }, []);

    const handleMonthChange = (monthIdx: number) => {
        setCurrentDate(setMonth(currentDate, monthIdx));
    };

    const handleYearChange = (year: number) => {
        setCurrentDate(setYear(currentDate, year));
    };

    return (
        <div className="min-h-screen bg-zinc-100 print:bg-white font-sans overflow-x-hidden">
            {/* CONTROLS: HIDDEN ON PRINT */}
            <div className="p-4 bg-zinc-950 flex items-center justify-between print:hidden sticky top-0 z-[100] w-full">
                <div className="flex gap-2">
                    {["ohannah", "dream"].map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedCabin(c as any)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedCabin === c ? "bg-white text-black scale-105" : "text-zinc-500 hover:text-white"}`}
                        >
                            {c === "ohannah" ? "Ohannah Cabin" : "The Dream"}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6 text-white">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:scale-125 transition-transform"><ChevronLeft size={24} /></button>

                    {/* TRIGGER MODAL ON CLICK */}
                    <button
                        onClick={() => setShowPicker(true)}
                        className="group flex flex-col items-center px-4 py-1 hover:bg-white/10 rounded-xl transition-all"
                    >
                        <h3 className="text-lg font-black uppercase tracking-widest min-w-[200px] text-center group-hover:text-[#D4AF37]">
                            {format(currentDate, "MMMM yyyy")}
                        </h3>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em] group-hover:text-zinc-300">Click to Change</span>
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
                        <button
                            onClick={() => setShowPicker(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-6">
                            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                                <CalendarIcon size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter">Jump to Date</h4>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select month and year to view</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Months Grid */}
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Select Month</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {months.map((m, idx) => (
                                        <button
                                            key={m}
                                            onClick={() => handleMonthChange(idx)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentDate.getMonth() === idx
                                                ? "bg-zinc-900 text-white"
                                                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                                                }`}
                                        >
                                            {m.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Years Grid */}
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Select Year</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {years.map((y) => (
                                        <button
                                            key={y}
                                            onClick={() => handleYearChange(y)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getYear(currentDate) === y
                                                ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200"
                                                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                                                }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPicker(false)}
                            className="w-full mt-10 py-5 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20"
                        >
                            Apply Selection
                        </button>
                    </div>
                </div>
            )}

            {/* PRINT AREA */}
            <div id="print-content" className="w-full mx-auto bg-white p-12 print:p-0 min-h-screen flex flex-col shadow-2xl print:shadow-none">

                {/* HEADER DESIGN */}
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

                {/* THE GRID */}
                <div className="flex-1 flex flex-col relative">
                    <div className="grid grid-cols-7 ml-[50px] border-t-2 border-zinc-300">
                        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(d => (
                            <div key={d} className="py-2 text-center font-bold text-[10px] tracking-[0.2em] text-zinc-500">{d}</div>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col border-[2px] border-black ml-[50px] relative overflow-hidden">
                        {renderPrintGrid(currentDate, filteredBookings)}
                    </div>
                </div>
            </div>


            <style>{`
    @media print {
        @page { 
            size: landscape; 
            margin: 0 !important; 
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
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            z-index: 9999;
        }

        .print\:hidden { 
            display: none !important; 
        }

        /* Pinatinding Grid Lines para sa B&W Printers */
        .calendar-row {
            border-bottom: 2px solid black !important;
        }
        .day-box {
            border-right: 2px solid black !important;
            background-color: transparent !important;
        }
        .day-box:last-child {
            border-right: 2px solid black !important;
        }
    }

    /* Layout para sa Screen */
    .day-box { 
        border-right: 2px solid black; 
        position: relative; 
        flex: 1; 
        min-height: 0; 
        min-width: 0;
    }
    .calendar-row { 
        flex: 1; 
        display: flex; 
        min-height: 0; 
    }
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
                                <span className="absolute top-1 left-1.5 font-bold text-xl text-zinc-300 z-0 select-none">
                                    {format(day, "d")}
                                </span>
                                <div className="absolute inset-0 z-10">
                                    {booking && <PrintBookingItem booking={booking} />}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    ));
}
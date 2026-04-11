import React, { useMemo } from "react";
import { parseISO } from "date-fns";
import { Clock, Calendar as CalendarIcon, Users } from "lucide-react";

const BOOKING_COLORS = [
    { id: "pink", label: "Pink Slot", bg: "bg-pink-400" },
    { id: "red", label: "Red Slot", bg: "bg-red-400" },
    { id: "orange", label: "Orange Slot", bg: "bg-orange-400" },
    { id: "yellow", label: "Yellow Slot", bg: "bg-yellow-400" },
    { id: "green", label: "Green Slot", bg: "bg-green-400" },
    { id: "blue", label: "Blue Slot", bg: "bg-blue-400" },
    { id: "indigo", label: "Indigo Slot", bg: "bg-indigo-400" },
    { id: "violet", label: "Violet Slot", bg: "bg-violet-400" },
];

interface BookingCategoryProps {
    stayType: string; setStayType: (v: string) => void;
    checkIn: string; setCheckIn: (v: string) => void;
    checkOut: string; setCheckOut: (v: string) => void;
    guests: number; setGuests: (v: number) => void;
    pets: number; setPets: (v: number) => void;
    selectedColor: string; setSelectedColor: (v: string) => void;
    filteredBookings: any[]; todayStr: string;
}

export function BookingCategory({
    stayType, setStayType, checkIn, setCheckIn, checkOut, setCheckOut,
    guests, setGuests, pets, setPets, selectedColor, setSelectedColor,
    filteredBookings, todayStr
}: BookingCategoryProps) {

    const dynamicColors = useMemo(() => {
        const start = parseISO(checkIn);
        const end = parseISO(checkOut);
        const blocked = new Set(
            filteredBookings
                .filter(b => (start <= parseISO(b.checkOut) && end >= parseISO(b.checkIn)))
                .map(b => b.color)
        );
        return BOOKING_COLORS.map(c => ({ ...c, isBlocked: blocked.has(c.id) }));
    }, [checkIn, checkOut, filteredBookings]);

    return (
        <section className="bg-white rounded-[3rem] p-12 border border-zinc-100 space-y-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-[#D4AF37]" /> Stay Category
                        </label>
                        <select value={stayType} onChange={(e) => setStayType(e.target.value)} className="w-full p-5 rounded-2xl bg-zinc-50 border-none outline-none text-[11px] font-bold uppercase focus:ring-2 focus:ring-[#D4AF37]/20">
                            <option value="full">🏠 Full Stay (Overnight)</option>
                            <option value="day">☀️ Day Lounge (9am-5pm)</option>
                            <option value="evening">🌙 Evening Chill (8pm-7am)</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon size={14} className="text-[#D4AF37]" /> Check-in/Out
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" value={checkIn} min={todayStr} onChange={(e) => setCheckIn(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-50 border-none text-[11px] font-bold" />
                            <input type="date" value={checkOut} disabled={stayType !== "full"} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-50 border-none text-[11px] font-bold disabled:opacity-30" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} className="text-[#D4AF37]" /> Pax & Pets
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-[8px] text-zinc-400 font-bold uppercase">Guests</span>
                            <input type="number" value={guests} onChange={(e) => setGuests(Math.min(Number(e.target.value), 12))} className="w-full p-5 rounded-2xl bg-zinc-50 border-none text-[13px] font-black" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[8px] text-zinc-400 font-bold uppercase">Pets</span>
                            <input type="number" value={pets} onChange={(e) => setPets(Math.min(Number(e.target.value), 12))} className="w-full p-5 rounded-2xl bg-zinc-50 border-none text-[13px] font-black" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-zinc-50">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] block mb-8 text-center">Select Personal Slot Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {dynamicColors.map(c => (
                        <button key={c.id} disabled={c.isBlocked} onClick={() => setSelectedColor(c.id)}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedColor === c.id ? 'bg-zinc-950 text-white border-zinc-950 scale-105 shadow-xl' : 'bg-white text-zinc-400 border-zinc-50 hover:border-zinc-200'} ${c.isBlocked ? 'opacity-10 grayscale cursor-not-allowed' : ''}`}>
                            <span className={`w-4 h-4 rounded-full ${c.bg} border border-black/5`} />
                            <span className="text-[9px] font-black uppercase">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
import React, { useState, useMemo, useEffect } from "react";
import { format, addDays, parseISO, isWeekend, differenceInDays } from "date-fns";
import { ChevronLeft, Clock, Calendar as CalendarIcon, Users } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";

import { PriceSummary } from "./PriceSummary";
import { CalendarBooked, checkIsHoliday } from "./CalendarBooked";

const PRICING = {
  ohannah: { day: { weekday: 5500, weekend: 6000 }, evening: { weekday: 7500, weekend: 8000 }, full: { weekday: 10000, weekend: 11000 } },
  dream: { day: { weekday: 6000, weekend: 7000 }, evening: { weekday: 8000, weekend: 9000 }, full: { weekday: 12000, weekend: 13000 } }
};

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

export function BookingPage({ onBack, onRequireAuth }: { onBack: () => void; onRequireAuth?: () => void }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [cabin, setCabin] = useState("ohannah");
  const [stayType, setStayType] = useState("full");
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 2), "yyyy-MM-dd"));
  const [guests, setGuests] = useState(4);
  const [pets, setPets] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbHolidays, setDbHolidays] = useState<string[]>([]); // State for holidays from DB
  const [submitting, setSubmitting] = useState(false);

  // 1. Listen for Bookings
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "bookings"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDbBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen for Movable Holidays
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "metadata", "holidays"), (docSnap) => {
      if (docSnap.exists()) setDbHolidays(docSnap.data().dates || []);
    });
    return () => unsub();
  }, []);

  const filteredBookings = useMemo(() =>
    dbBookings.filter(b => b.cabin === cabin && (b.status === "Approved" || b.status === "Confirmed")),
    [cabin, dbBookings]);

  const durationCount = useMemo(() =>
    stayType === "full" ? Math.max(differenceInDays(parseISO(checkOut), parseISO(checkIn)), 1) : 1,
    [checkIn, checkOut, stayType]);

  // CALCULATION LOGIC
  const totalPrice = useMemo(() => {
    const checkInDate = parseISO(checkIn);
    const isHoliday = checkIsHoliday(checkInDate, dbHolidays);
    const isHighRate = isWeekend(checkInDate) || isHoliday;

    // @ts-ignore
    const base = PRICING[cabin][stayType][isHighRate ? "weekend" : "weekday"];
    const extraPax = guests > 4 ? (guests - 4) * (stayType === 'full' ? 500 : 300) : 0;
    return (base * durationCount) + extraPax + (pets * 250);
  }, [cabin, stayType, checkIn, guests, pets, durationCount, dbHolidays]);

  const isDateRangeValid = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    return !filteredBookings.some(b => (start <= parseISO(b.checkOut) && end >= parseISO(b.checkIn)));
  }, [checkIn, checkOut, filteredBookings]);

  const dynamicColors = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const blocked = new Set(filteredBookings.filter(b => (start <= parseISO(b.checkOut) && end >= parseISO(b.checkIn))).map(b => b.color));
    return BOOKING_COLORS.map(c => ({ ...c, isBlocked: blocked.has(c.id) }));
  }, [checkIn, checkOut, filteredBookings]);

  const handleBooking = async () => {
    if (!user) return onRequireAuth?.();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid, cabin, stayType, checkIn, checkOut, guests, pets,
        color: selectedColor, totalPrice, status: "Pending", createdAt: serverTimestamp()
      });
      addNotification({ title: "Success", description: "Booking Request Sent!", read: false });
    } catch (err) {
      addNotification({ title: "Error", description: "Failed to save booking", read: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24 text-zinc-900">
      <nav className="bg-white/80 backdrop-blur-xl border-b px-8 py-6 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-950 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit</span>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Cabin Selection */}
          <section className="bg-zinc-950 p-2 rounded-[2rem] flex gap-2 shadow-2xl">
            {["ohannah", "dream"].map(c => (
              <button key={c} onClick={() => { setCabin(c); setSelectedColor(""); }}
                className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${cabin === c ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-white'}`}>
                {c === 'ohannah' ? 'Ohannah Cabin' : 'The Dream by Ohannah'}
              </button>
            ))}
          </section>

          {/* Calendar Component */}
          <CalendarBooked
            currentViewDate={currentViewDate}
            setCurrentViewDate={setCurrentViewDate}
            filteredBookings={filteredBookings}
            bookingColors={BOOKING_COLORS}
          />

          {/* Booking Inputs */}
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

            {/* Color Selector */}
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
        </div>

        {/* Price Summary Panel */}
        <div className="lg:col-span-4 h-fit sticky top-32">
          <PriceSummary
            cabin={cabin} stayType={stayType} guests={guests} pets={pets}
            durationCount={durationCount} totalPrice={totalPrice}
            canBookCore={isDateRangeValid && selectedColor !== ""}
            submitting={submitting} selectedColor={selectedColor}
            isDateRangeValid={isDateRangeValid} onShowPriceList={() => { }}
            onSubmit={handleBooking}
          />
        </div>
      </div>
    </div>
  );
}
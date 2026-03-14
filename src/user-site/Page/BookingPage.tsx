import React, { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isWeekend,
  isAfter,
  isBefore,
  addDays,
  subDays,
  isSameDay,
  differenceInDays,
  addMonths, // Idinagdag para sa calendar navigation
  subMonths, // Idinagdag para sa calendar navigation
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  X,
  Zap,
  Clock,
  CheckCircle2
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";
import { db } from "../../shared/lib/firebase";

// --- Configuration ---
const PRICING = {
  ohannah: {
    day: { weekday: 5500, weekend: 6000 },
    evening: { weekday: 7500, weekend: 8000 },
    full: { weekday: 10000, weekend: 11000 },
  },
  dream: {
    day: { weekday: 6000, weekend: 7000 },
    evening: { weekday: 8000, weekend: 9000 },
    full: { weekday: 12000, weekend: 13000 },
  }
};

const BOOKING_COLORS = [
  { id: "pink", label: "Pink Slot", bg: "bg-pink-400" },
  { id: "purple", label: "Purple Slot", bg: "bg-purple-400" },
  { id: "blue", label: "Blue Slot", bg: "bg-blue-400" },
  { id: "red", label: "Red Slot", bg: "bg-red-400" },
  { id: "green", label: "Green Slot", bg: "bg-green-400" },
  { id: "orange", label: "Orange Slot", bg: "bg-orange-400" },
];

const EXISTING_BOOKINGS = [
  { color: "green", start: "2026-03-06", end: "2026-03-10" },
  { color: "red", start: "2026-03-13", end: "2026-03-15" },
];

interface BookingPageProps {
  onBack: () => void;
  onRequireAuth?: () => void;
}

export function BookingPage({ onBack, onRequireAuth }: BookingPageProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [currentViewDate, setCurrentViewDate] = useState(new Date(2026, 2, 1));
  const [cabin, setCabin] = useState("ohannah");
  const [stayType, setStayType] = useState("full");
  const [checkIn, setCheckIn] = useState("2026-03-18");
  const [checkOut, setCheckOut] = useState("2026-03-20");
  const [guests, setGuests] = useState(4);
  const [pets, setPets] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [showPriceList, setShowPriceList] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- LOGIC: Auto-adjust Dates ---
  useEffect(() => {
    const start = parseISO(checkIn);
    if (stayType === "day") {
      setCheckOut(checkIn);
    } else if (stayType === "evening") {
      setCheckOut(format(addDays(start, 1), "yyyy-MM-dd"));
    } else if (stayType === "full") {
      if (isSameDay(start, parseISO(checkOut)) || isBefore(parseISO(checkOut), start)) {
        setCheckOut(format(addDays(start, 1), "yyyy-MM-dd"));
      }
    }
  }, [stayType, checkIn, checkOut]);

  // --- LOGIC: DATE VALIDATION (Fix for the overlap issue) ---
  const isDateRangeValid = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);

    return !EXISTING_BOOKINGS.some(b => {
      const bStart = parseISO(b.start);
      const bEnd = parseISO(b.end);

      // Overlap detection formula: (StartA <= EndB) and (EndA >= StartB)
      // I-check kung ang napiling date range ay tumatama sa kahit anong existing booking
      return (start <= bEnd && end >= bStart);
    });
  }, [checkIn, checkOut]);

  // --- LOGIC: Color Neighbor Conflict ---
  const dynamicColors = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const dayBefore = subDays(start, 1);
    const dayAfter = addDays(end, 1);

    const blockedColors = new Set();

    EXISTING_BOOKINGS.forEach(b => {
      const bStart = parseISO(b.start);
      const bEnd = parseISO(b.end);

      // I-block ang color kung katabi lang ng existing booking (neighboring)
      if (isSameDay(dayBefore, bEnd) || isSameDay(dayAfter, bStart)) {
        blockedColors.add(b.color);
      }

      // I-block din ang color kung may direct overlap
      if (start <= bEnd && end >= bStart) {
        blockedColors.add(b.color);
      }
    });

    return BOOKING_COLORS.map(c => ({
      ...c,
      isBlocked: blockedColors.has(c.id)
    }));
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (dynamicColors.find(c => c.id === selectedColor)?.isBlocked) {
      setSelectedColor("");
    }
  }, [dynamicColors, selectedColor]);

  const durationCount = useMemo(() => {
    if (stayType !== "full") return 1;
    const diff = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut, stayType]);

  const totalPrice = useMemo(() => {
    const start = parseISO(checkIn);
    const dayName = isWeekend(start) ? "weekend" : "weekday";
    // @ts-ignore
    const baseRate = PRICING[cabin][stayType][dayName];
    const extraPaxFee = guests > 4 ? (guests - 4) * (stayType === 'full' ? 500 : 300) : 0;
    const petFee = pets * 250;
    return (baseRate * durationCount) + extraPaxFee + petFee;
  }, [cabin, stayType, checkIn, guests, pets, durationCount]);

  const canBookCore = isDateRangeValid && selectedColor !== "" && guests > 0;
  const canBook = canBookCore && !!user && !submitting;

  const handleSubmitBooking = async () => {
    if (!canBookCore) return;
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }
    if (!db) {
      console.warn("[Booking] Firestore is not configured. Booking will not be saved.");
      setShowSuccessPopup(true);
      return;
    }

    try {
      setSubmitting(true);
      const bookingsRef = collection(db, "bookings");
      await addDoc(bookingsRef, {
        userId: user.uid,
        userEmail: user.email ?? null,
        cabin,
        stayType,
        checkIn,
        checkOut,
        guests,
        pets,
        color: selectedColor,
        totalPrice,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      addNotification({
        title: "Booking request sent",
        description:
          "Your booking will be reviewed by the admin. Watch out for confirmation updates.",
        read: false,
      });

      setShowSuccessPopup(true);
    } catch (error) {
      console.error("[Booking] Failed to save booking:", error);
      addNotification({
        title: "Booking failed",
        description: "Something went wrong while saving your booking. Please try again.",
        read: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-12 font-sans relative">

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-2">Request Sent!</h2>
            <p className="text-sm text-stone-500 font-medium mb-6 leading-relaxed">
              Your booking will be viewed and reviewed by the admin. Please wait for the confirmation.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* MODAL PRICE LIST */}
      {showPriceList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md" onClick={() => setShowPriceList(false)}>
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPriceList(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full transition z-10 hover:bg-black"><X className="w-5 h-5" /></button>
            <img src="section/price.jpg" alt="Price List" className="w-full h-auto object-contain" />
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-stone-600 hover:text-black transition">
          <ChevronLeft className="w-5 h-5" /> <span className="font-bold text-sm tracking-tight uppercase">Back</span>
        </button>
        <h1 className="text-lg font-black text-stone-800 tracking-tighter uppercase">Cabin Booking</h1>
        <div className="w-10" />
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* CALENDAR SECTION */}
          <section className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))} className="p-1.5 hover:bg-white rounded-lg border shadow-sm transition"><ChevronLeft className="w-4 h-4" /></button>
                <h2 className="text-sm font-black text-stone-800 min-w-[140px] text-center uppercase tracking-tighter">{format(currentViewDate, "MMMM yyyy")}</h2>
                <button onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))} className="p-1.5 hover:bg-white rounded-lg border shadow-sm transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-4 sm:p-8">
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-stone-300 uppercase pb-4">{d}</div>
                ))}
                {renderCalendarDays(currentViewDate, EXISTING_BOOKINGS)}
              </div>
            </div>
          </section>

          {/* FORM SECTION */}
          <section className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" /> Type of Stay</label>
                  <select value={stayType} onChange={(e) => setStayType(e.target.value)} className="w-full p-4 rounded-xl border bg-white outline-none text-sm font-black text-stone-800 border-stone-200 shadow-sm focus:ring-2 focus:ring-stone-900 transition-all">
                    <option value="full">🏠 FULL STAY (OVERNIGHT)</option>
                    <option value="day">☀️ DAY LOUNGE (9AM-5PM)</option>
                    <option value="evening">🌙 EVENING CHILL (8PM-7AM)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Check-in & Out</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-stone-400 uppercase">Check-in</span>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full p-3 rounded-xl border bg-stone-50 outline-none text-sm font-bold border-stone-200" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-stone-400 uppercase">Check-out</span>
                      <input
                        type="date"
                        value={checkOut}
                        disabled={stayType !== "full"}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className={`w-full p-3 rounded-xl border outline-none text-sm font-bold transition-all ${stayType !== "full" ? 'bg-stone-100 text-stone-400 cursor-not-allowed border-stone-100' : 'bg-stone-50 border-stone-200'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> Pax & Pets (Max 12)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-stone-400 uppercase">Guests (₱300/500)</span>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={guests}
                        onChange={(e) => setGuests(Math.min(12, Number(e.target.value)))}
                        className={`w-full p-3 rounded-xl border outline-none text-sm font-bold transition-all ${guests === 0 ? 'border-red-400 bg-red-50' : 'bg-stone-50 border-stone-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-stone-400 uppercase">Pets (₱250)</span>
                      <input type="number" min="0" max="12" value={pets} onChange={(e) => setPets(Math.min(12, Number(e.target.value)))} className="w-full p-3 rounded-xl border bg-stone-50 outline-none text-sm font-bold border-stone-200" />
                    </div>
                  </div>
                  {guests === 0 && <p className="text-[9px] text-red-500 font-black uppercase">Min. 1 guest required</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest block">Select Cabin</label>
                  <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="w-full p-3 rounded-xl border bg-white outline-none font-black text-sm uppercase border-stone-200">
                    <option value="ohannah">Ohannah Cabin</option>
                    <option value="dream">The Dream by Ohannah</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest block mb-4">Slot Color</label>
              <div className="flex flex-wrap gap-2">
                {dynamicColors.map((c) => (
                  <button
                    key={c.id}
                    disabled={c.isBlocked}
                    onClick={() => setSelectedColor(c.id)}
                    className={`px-4 py-2 rounded-full border-2 text-[10px] font-black transition-all ${selectedColor === c.id ? 'border-stone-900 bg-stone-50' : 'border-transparent bg-stone-100'} ${c.isBlocked ? 'opacity-10 cursor-not-allowed grayscale' : 'hover:scale-105 uppercase'}`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${c.bg}`} /> {c.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl border border-white/5">
            <h3 className="text-lg font-black mb-8 border-b border-stone-700 pb-4 flex items-center justify-between uppercase">Details <Zap className="w-5 h-5 text-yellow-400" /></h3>

            <div className="space-y-4 mb-8">
              <SummaryItem label="Cabin" value={cabin.toUpperCase()} />
              <SummaryItem label="Stay" value={stayType.toUpperCase()} />
              <SummaryItem label="Duration" value={`${durationCount} ${stayType === 'full' ? 'Night(s)' : 'Session'}`} />
              <SummaryItem label="Guests" value={`${guests} Pax`} />
              <SummaryItem label="Pets" value={`${pets} Head(s)`} />
              <button onClick={() => setShowPriceList(true)} className="w-full mt-4 py-3 bg-stone-800/50 border border-stone-700 rounded-xl text-[10px] font-black text-stone-400 hover:text-white transition uppercase">Check Rate Sheet</button>
            </div>

            <div className="bg-stone-800 rounded-3xl p-6 mb-8 text-center border border-white/5">
              <span className="text-stone-500 text-[10px] font-black uppercase tracking-widest">Total Price</span>
              <div className="text-5xl font-black mt-1 tracking-tighter">₱{totalPrice.toLocaleString()}</div>
              <p className="text-[9px] text-stone-600 font-bold uppercase mt-2">VAT Included</p>
            </div>

            <button
              disabled={!canBookCore || submitting}
              onClick={handleSubmitBooking}
              className={`w-full py-5 rounded-2xl font-black text-base transition-all shadow-xl active:scale-95 ${(!canBook) ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-white text-stone-900 hover:bg-stone-100'}`}
            >
              {submitting
                ? "SENDING..."
                : guests === 0
                ? "ENTER PAX"
                : !selectedColor
                ? "PICK A COLOR SLOT"
                : !isDateRangeValid
                ? "DATE TAKEN"
                : !user
                ? "SIGN IN TO BOOK"
                : "BOOK NOW"}
            </button>
            <p className="text-center text-[9px] text-stone-600 mt-6 font-bold uppercase tracking-widest">50% Downpayment is Required</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helpers
function renderCalendarDays(viewDate: Date, bookings: any[]) {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start, end });
  const firstDow = (start.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(<div key={`pad-${i}`} />);

  days.forEach(d => {
    const booking = bookings.find(b => {
      const bStart = parseISO(b.start);
      const bEnd = parseISO(b.end);
      // I-check kung ang partikular na araw sa calendar ay kasama sa booked date range
      return (d >= bStart && d <= bEnd);
    });

    const color = booking ? BOOKING_COLORS.find(c => c.id === booking.color) : null;

    cells.push(
      <div key={d.toString()} className={`h-14 sm:h-20 border border-stone-50 flex flex-col items-center justify-center rounded-xl relative transition-all ${color ? `${color.bg} text-white scale-[1.02] shadow-sm z-10` : "hover:bg-stone-100 text-stone-600"}`}>
        <span className="text-xs font-black">{format(d, "d")}</span>
        {color && <span className="text-[6px] uppercase font-black opacity-80 mt-1">Booked</span>}
      </div>
    );
  });
  return cells;
}

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-stone-500 font-bold uppercase text-[9px] tracking-widest">{label}</span>
      <span className="font-bold text-stone-100">{value}</span>
    </div>
  );
}
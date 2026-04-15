import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format, addDays, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";

import { PriceSummary } from "./PriceSummary";
import { CalendarBooked } from "./CalendarBooked";
import { BookingCategory } from "./BookingCategory";
import { BookingConfirmation } from "./BookingConfirmation";
import { checkIsHighRate, CabinId, StayType } from "../../shared/lib/bookingPricing";

export function BookingPage({ onBack, onRequireAuth }: { onBack: () => void; onRequireAuth?: () => void }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // --- STATES ---
  const [cabin, setCabin] = useState<CabinId>("ohannah");
  const [stayType, setStayType] = useState<StayType>("full");
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [guests, setGuests] = useState(4);
  const [kids, setKids] = useState(0); // Added Kids state
  const [pets, setPets] = useState(0);
  const [specialOccasion, setSpecialOccasion] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbHolidays, setDbHolidays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastBookingData, setLastBookingData] = useState<any>(null);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "bookings"));
    const unsubBookings = onSnapshot(q, (snap) => {
      setDbBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubHolidays = onSnapshot(doc(db, "metadata", "holidays"), (docSnap) => {
      if (docSnap.exists()) setDbHolidays(docSnap.data().dates || []);
    });
    return () => { unsubBookings(); unsubHolidays(); };
  }, []);

  // --- LOGIC HANDLERS ---

  // Update Checkout automatically when Checkin or StayType changes
  const handleDateLogic = useCallback((newIn: string, type: StayType) => {
    setCheckIn(newIn);
    if (type === "full") {
      const nextDay = format(addDays(parseISO(newIn), 1), "yyyy-MM-dd");
      setCheckOut(nextDay);
    } else {
      setCheckOut(newIn); // Same day for Day/Evening lounge
    }
  }, []);

  const filteredBookings = useMemo(() =>
    dbBookings.filter(b => b.cabin === cabin && (b.status === "Approved" || b.status === "Confirmed")),
    [cabin, dbBookings]);

  const durationCount = useMemo(() => {
    if (stayType !== "full") return 1;
    const diff = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    return Math.max(diff, 1);
  }, [checkIn, checkOut, stayType]);

  const isHighRate = useMemo(() => {
    return checkIsHighRate(parseISO(checkIn), dbHolidays);
  }, [checkIn, dbHolidays]);

  const isDateRangeValid = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    // Prevents booking if dates overlap with existing approved bookings
    return !filteredBookings.some(b => {
      const bStart = parseISO(b.checkInDate || b.checkIn); // Ensure field name matches DB
      const bEnd = parseISO(b.checkOutDate || b.checkOut);
      return (start < bEnd && end > bStart);
    });
  }, [checkIn, checkOut, filteredBookings]);

  const handleBooking = async (finalPrice: number) => {
    if (!user) return onRequireAuth?.();
    if (!selectedColor) return alert("Please select a color slot.");

    setSubmitting(true);
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const profile = userSnap.exists() ? userSnap.data() : null;

      const bookingPayload = {
        customerName: profile?.fullName || user.displayName || "Valued Guest",
        userId: user.uid,
        cabin,
        stayType,
        checkIn,
        checkOut,
        guests,
        kids,
        pets,
        specialOccasion,
        color: selectedColor,
        isHighRate,
        totalPrice: finalPrice,
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingPayload);

      setLastBookingData(bookingPayload);
      setShowConfirmation(true);
      addNotification({ title: "Success", description: "Booking Request Sent!", read: false });
    } catch (err) {
      console.error(err);
      addNotification({ title: "Error", description: "Failed to save booking", read: false });
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER VIEWS ---
  if (showConfirmation && lastBookingData) {
    return (
      <div className="min-h-screen bg-zinc-50 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => window.location.reload()} className="mb-8 flex items-center gap-2 text-zinc-400">
            <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Back to Home</span>
          </button>
          <BookingConfirmation bookingData={lastBookingData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24 text-zinc-900">
      <nav className="bg-white/80 backdrop-blur-xl border-b px-8 py-6 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-950">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit</span>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* CABIN SELECTOR */}
          <section className="bg-zinc-950 p-2 rounded-[2rem] flex gap-2">
            {(["ohannah", "dream"] as CabinId[]).map(c => (
              <button key={c} onClick={() => { setCabin(c); setSelectedColor(""); }}
                className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${cabin === c ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-white'}`}>
                {c === 'ohannah' ? 'Ohannah Cabin' : 'The Dream'}
              </button>
            ))}
          </section>

          <CalendarBooked
            currentViewDate={currentViewDate}
            setCurrentViewDate={setCurrentViewDate}
            filteredBookings={filteredBookings}
          />

          <BookingCategory
            cabin={cabin}
            stayType={stayType}
            setStayType={(t) => { setStayType(t); handleDateLogic(checkIn, t); }}
            checkIn={checkIn}
            setCheckIn={(d) => handleDateLogic(d, stayType)}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            guests={guests}
            setGuests={setGuests}
            kids={kids}
            setKids={setKids}
            pets={pets}
            setPets={setPets}
            specialOccasion={specialOccasion}
            setSpecialOccasion={setSpecialOccasion}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            filteredBookings={filteredBookings}
            todayStr={todayStr}
          />
        </div>

        <div className="lg:col-span-4 h-fit sticky top-32">
          <PriceSummary
            cabin={cabin}
            stayType={stayType}
            guests={guests}
            kids={kids}
            pets={pets}
            checkIn={checkIn}
            checkOut={checkOut}
            specialOccasion={specialOccasion}
            durationCount={durationCount}
            isHighRate={isHighRate}
            canBookCore={isDateRangeValid && selectedColor !== "" && durationCount > 0}
            submitting={submitting}
            onSubmit={handleBooking}
          />
        </div>
      </div>
    </div>
  );
}
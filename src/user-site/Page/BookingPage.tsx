import React, { useState, useMemo, useEffect } from "react";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";

import { PriceSummary } from "./PriceSummary";
import { CalendarBooked, checkIsHoliday } from "./CalendarBooked";
import { BookingCategory } from "./BookingCategory";
import { BookingConfirmation } from "./BookingConfirmation"; // SIGURADUHING TAMA ANG PATH

export function BookingPage({ onBack, onRequireAuth }: { onBack: () => void; onRequireAuth?: () => void }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [cabin, setCabin] = useState<any>("ohannah");
  const [stayType, setStayType] = useState<any>("full");
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [guests, setGuests] = useState(4);
  const [pets, setPets] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbHolidays, setDbHolidays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastBookingData, setLastBookingData] = useState<any>(null);

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

  const filteredBookings = useMemo(() =>
    dbBookings.filter(b => b.cabin === cabin && (b.status === "Approved" || b.status === "Confirmed")),
    [cabin, dbBookings]);

  const durationCount = useMemo(() =>
    stayType === "full" ? Math.max(differenceInDays(parseISO(checkOut), parseISO(checkIn)), 1) : 1,
    [checkIn, checkOut, stayType]);

  const isHolidayOrWeekend = useMemo(() => {
    const d = parseISO(checkIn);
    return checkIsHoliday(d, dbHolidays);
  }, [checkIn, dbHolidays]);

  const isDateRangeValid = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    return !filteredBookings.some(b => (start <= parseISO(b.checkOut) && end >= parseISO(b.checkIn)));
  }, [checkIn, checkOut, filteredBookings]);

  const handleBooking = async (finalPrice: number) => {
    if (!user) return onRequireAuth?.();
    setSubmitting(true);

    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const profile = userSnap.exists() ? userSnap.data() : null;

      const bookingPayload = {
        customerName: profile?.fullName || user.displayName || "Valued Guest",
        mobile: profile?.mobile || "Not Provided",
        address: profile?.address || "No Address Provided",
        cabin, stayType,
        checkIn: `${stayType === 'day' ? '9AM' : stayType === 'evening' ? '8PM' : '2PM'} of ${format(parseISO(checkIn), "MMMM dd, yyyy")}`,
        checkOut: `${stayType === 'day' ? '5PM' : stayType === 'evening' ? '7AM' : '12PM'} of ${format(parseISO(checkOut), "MMMM dd, yyyy")}`,
        guests, pets,
        isHighRate: isHolidayOrWeekend,
        totalPrice: finalPrice,
      };

      await addDoc(collection(db, "bookings"), {
        ...bookingPayload,
        userId: user.uid,
        color: selectedColor,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      setLastBookingData(bookingPayload);
      setShowConfirmation(true);
      addNotification({ title: "Success", description: "Booking Request Sent!", read: false });
    } catch (err) {
      addNotification({ title: "Error", description: "Failed to save booking", read: false });
    } finally {
      setSubmitting(false);
    }
  };

  if (showConfirmation && lastBookingData) {
    return (
      <div className="min-h-screen bg-zinc-50 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => window.location.reload()} className="mb-8 flex items-center gap-2 text-zinc-400">
            <ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Finish</span>
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
          <section className="bg-zinc-950 p-2 rounded-[2rem] flex gap-2">
            {["ohannah", "dream"].map(c => (
              <button key={c} onClick={() => { setCabin(c); setSelectedColor(""); }}
                className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${cabin === c ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-white'}`}>
                {c === 'ohannah' ? 'Ohannah Cabin' : 'The Dream'}
              </button>
            ))}
          </section>
          <CalendarBooked currentViewDate={currentViewDate} setCurrentViewDate={setCurrentViewDate} filteredBookings={filteredBookings} />
          <BookingCategory stayType={stayType} setStayType={setStayType} checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut} guests={guests} setGuests={setGuests} pets={pets} setPets={setPets} selectedColor={selectedColor} setSelectedColor={setSelectedColor} filteredBookings={filteredBookings} todayStr={todayStr} />
        </div>
        <div className="lg:col-span-4 h-fit sticky top-32">
          <PriceSummary cabin={cabin} stayType={stayType} guests={guests} pets={pets} durationCount={durationCount} isHighRate={isHolidayOrWeekend} canBookCore={isDateRangeValid && selectedColor !== ""} submitting={submitting} selectedColor={selectedColor} isDateRangeValid={isDateRangeValid} onSubmit={handleBooking} />
        </div>
      </div>
    </div>
  );
}
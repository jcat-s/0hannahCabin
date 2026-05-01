import { useState, useMemo, useEffect, useCallback } from "react";
import { format, addDays, parseISO, differenceInDays, isSameDay, subDays } from "date-fns";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../shared/lib/firebase";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";
import { checkIsHighRate, CabinId, StayType } from "../../shared/lib/bookingPricing";

export function useBooking() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const todayStr = format(new Date(), "yyyy-MM-dd");

    // --- STATES ---
    const [cabin, setCabin] = useState<CabinId>("ohannah");
    const [stayType, setStayType] = useState<StayType>("full");
    const [checkIn, setCheckIn] = useState(todayStr);
    const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
    const [guests, setGuests] = useState(4);
    const [kids, setKids] = useState(0);
    const [pets, setPets] = useState(0);
    const [specialOccasion, setSpecialOccasion] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [fullStayOption, setFullStayOption] = useState<"9AM-7AM" | "8PM-5PM">("9AM-7AM");
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
    const handleDateLogic = useCallback((newIn: string, type: StayType) => {
        setCheckIn(newIn);
        if (type === "day") {
            setCheckOut(newIn);
        } else {
            const nextDay = format(addDays(parseISO(newIn), 1), "yyyy-MM-dd");
            setCheckOut(nextDay);
        }
    }, []);

    // Helper: Mismong overlap logic (Hindi kasama ang adjacency/magkadikit)
    const rangesOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) => {
        // Exclusive boundary check: startA < endB && startB < endA
        // Ito ang nagpapahintulot na ang May 12 (Checkout) ay maging May 12 (Checkin) ng iba.
        return startA < endB && startB < endA;
    };

    const filteredBookings = useMemo(() =>
        dbBookings.filter(b => b.cabin === cabin && String(b.status).toLowerCase() === "confirmed"),
        [cabin, dbBookings]);

    const durationCount = useMemo(() => {
        if (stayType !== "full") return 1;
        const diff = differenceInDays(parseISO(checkOut), parseISO(checkIn));
        return Math.max(diff, 1);
    }, [checkIn, checkOut, stayType]);

    const isHighRate = useMemo(() => {
        return checkIsHighRate(parseISO(checkIn), dbHolidays);
    }, [checkIn, dbHolidays]);

    // FIX: Dito titingnan kung VALID ang date (walang sumasapaw na booking kahit anong kulay)
    const isDateRangeValid = useMemo(() => {
        const start = parseISO(checkIn);
        // Kung "day" stay, ang end ay saktong kinabukasan para sa comparison
        const end = stayType === "day" ? addDays(start, 1) : addDays(parseISO(checkOut), 1);

        return !filteredBookings.some(b => {
            const bStart = parseISO(b.checkInDate || b.checkIn);
            const bEnd = addDays(parseISO(b.checkOutDate || b.checkOut), 1);
            return rangesOverlap(start, end, bStart, bEnd);
        });
    }, [checkIn, checkOut, stayType, filteredBookings]);

    // FIX: COLOR LOGIC (Dito na-aapply yung rules mo sa kulay)
    // Ang Red ay maba-block kung:
    // 1. May overlap (Mismong May 6-12)
    // 2. May adjacency (May 5 o May 13)
    useEffect(() => {
        if (!selectedColor || !checkIn) return;

        const start = parseISO(checkIn);
        const end = stayType === "full" ? parseISO(checkOut) : start;

        const isColorBlocked = filteredBookings.some(b => {
            if (b.color !== selectedColor) return false;

            const bStart = parseISO(b.checkInDate || b.checkIn);
            const bEnd = parseISO(b.checkOutDate || b.checkOut);

            // A. Overlap check
            const overlaps = start <= bEnd && bStart <= end;

            // B. Adjacency check
            const isDayAfter = isSameDay(start, addDays(bEnd, 1));
            const isDayBefore = isSameDay(end, subDays(bStart, 1));

            return overlaps || isDayAfter || isDayBefore;
        });

        if (isColorBlocked) {
            setSelectedColor(""); // Reset kung bawal ang kulay sa date na yan
        }
    }, [checkIn, checkOut, stayType, selectedColor, filteredBookings]);

    // --- BOOKING HANDLER ---
    const handleBooking = async (finalPrice: number) => {
        if (!user) {
            addNotification({ title: "Authentication", description: "Please sign in.", read: false });
            return false;
        }

        if (!selectedColor) {
            alert("Please select an available color slot.");
            return false;
        }

        if (!isDateRangeValid) {
            alert("This date range is already fully booked.");
            return false;
        }

        setSubmitting(true);
        try {
            const userSnap = await getDoc(doc(db!, "users", user.uid));
            const profile = userSnap.exists() ? userSnap.data() : null;

            const bookingPayload = {
                customerName: profile?.fullName || user.displayName || "Valued Guest",
                mobile: profile?.mobile || "",
                address: profile?.address || "",
                userId: user.uid,
                userEmail: user.email || "",
                userPhotoURL: profile?.photoURL || user.photoURL || "",
                cabin,
                stayType,
                fullStayOption: stayType === "full" ? fullStayOption : undefined,
                duration: durationCount,
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
                createdAt: new Date().toISOString(),
            };

            setLastBookingData(bookingPayload);
            setShowConfirmation(true);
            return true;
        } catch (err) {
            console.error(err);
            addNotification({ title: "Error", description: "Something went wrong.", read: false });
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        cabin, stayType, checkIn, checkOut, guests, kids, pets, specialOccasion,
        selectedColor, currentViewDate, dbBookings, dbHolidays, submitting,
        showConfirmation, lastBookingData,
        setCabin, setStayType, setCheckIn, setCheckOut, setGuests, setKids, setPets,
        setSpecialOccasion, setSelectedColor, setCurrentViewDate, setShowConfirmation,
        filteredBookings, durationCount, isHighRate, isDateRangeValid, todayStr,
        fullStayOption, setFullStayOption,
        handleDateLogic, handleBooking,
    };
}